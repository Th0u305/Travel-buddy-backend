# ⚙️ Travel Platform Backend - Hono & Deno

This is the core engine for the Travel & Community Platform. It handles identity management, automated profile provisioning, real-time messaging, and scheduled database tasks.

## 🛠️ Technology Stack

- **Runtime:** [Deno](https://deno.com/)
- **Web Framework:** [Hono](https://hono.dev/)
- **ORM:** [Prisma](https://www.prisma.io/) (via `@prisma/adapter-pg`)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Supabase)
- **Caching/Rate Limiting:** [Upstash Redis](https://upstash.com/)
- **Payments:** [Stripe](https://stripe.com/)
- **Email:** [Nodemailer](https://nodemailer.com/)

---

## 🏗️ Core Architecture: Database Automation

### User Provisioning & Slug Logic



```sql
-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ==============================================================================
-- 2. HELPER FUNCTIONS
-- ==============================================================================

-- Generates a unique URL-friendly slug based on user's full name
CREATE OR REPLACE FUNCTION public.generate_unique_slug(input_text TEXT, current_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Clean input: lowercase, replace special chars with hyphens, trim edges
  base_slug := LOWER(REGEXP_REPLACE(COALESCE(input_text, ''), '[^a-z0-9A-Z]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Fallback if empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'user-' || SUBSTRING(current_user_id::TEXT FROM 1 FOR 8);
  END IF;
  
  final_slug := base_slug;
  
  -- STRICTLY checking 'username_slug' for collisions
  WHILE EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username_slug = final_slug AND id != current_user_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- ==============================================================================
-- 3. AUTOMATION LOGIC (Supabase Auth Triggers)
-- ==============================================================================

-- Main function to handle new user signups from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_slug TEXT;
  full_name TEXT;
  new_payment_id UUID; 
BEGIN
  -- Extract name safely and generate unique slug
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_slug := public.generate_unique_slug(full_name, NEW.id);
  
  -- Create the payment record FIRST and catch the generated ID
  INSERT INTO public.payments (user_id)
  VALUES (NEW.id)
  RETURNING id INTO new_payment_id; 
  
  -- Insert into profiles using the caught payment ID as the stripe customer ID placeholder
  INSERT INTO public.profiles (
    id, email, full_name, username_slug, phone, country, is_password, providers, stripe_customer_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    full_name,
    user_slug,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'country', NULL),
    CASE WHEN NEW.raw_user_meta_data->>'is_password' = 'true' THEN true ELSE false END,
    ARRAY[]::text[],
    new_payment_id::text 
  );
  
  RETURN NEW;
END;
$$;

-- Function to sync OAuth providers (Google, Github, etc.)
CREATE OR REPLACE FUNCTION public.update_user_providers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET providers = (
    SELECT COALESCE(ARRAY_AGG(DISTINCT identity.provider)::text[], ARRAY[]::text[])
    FROM auth.identities identity
    WHERE identity.user_id = COALESCE(NEW.user_id, OLD.user_id)
  )
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN NEW;
END;
$$;

-- Bind the functions to actual database triggers
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER on_identity_created
  AFTER INSERT ON auth.identities
  FOR EACH ROW EXECUTE FUNCTION public.update_user_providers();

-- ==============================================================================
-- 4. SCHEDULED TASKS (CRON JOBS)
-- ==============================================================================

-- Function to automatically update trip statuses based on current date
CREATE OR REPLACE FUNCTION public.bulk_update_trip_statuses()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count int;
BEGIN
  UPDATE public.travel_plans
  SET status = CASE
    WHEN start_date > CURRENT_DATE THEN 'upcoming'
    WHEN end_date < CURRENT_DATE THEN 'completed'
    ELSE 'ongoing'
  END
  WHERE status != CASE
    WHEN start_date > CURRENT_DATE THEN 'upcoming'
    WHEN end_date < CURRENT_DATE THEN 'completed'
    ELSE 'ongoing'
  END;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN jsonb_build_object('success', true, 'updated', updated_count);
END;
$$;

-- Schedule the trip status update to run nightly at midnight
SELECT cron.schedule(
  'update-trip-statuses-nightly', 
  '0 0 * * *',                   
  'SELECT public.bulk_update_trip_statuses();' 
);
```


---

## 💬 Messaging & Real-time Schema

The messaging system is architected for high-concurrency real-time updates.

```sql
-- 1. Thread Management
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_group BOOLEAN DEFAULT FALSE NOT NULL,
  name TEXT, 
  group_image TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Membership with Role-Based Access
CREATE TABLE room_participants (
  id UUID DEFAULT gen_random_uuid() UNIQUE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK(role IN ('member', 'admin')),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (room_id, user_id)
);

-- 3. Message Storage
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK(type IN ('text', 'image', 'file')),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

## 🔒 Security & Performance

- **Row Level Security (RLS):** All tables are protected by RLS. We use **Security Definer** functions to prevent "Infinite Recursion" when checking room membership.
- **Optimized Indexing:** B-Tree indexes are applied to `room_id` and `created_at` on the `messages` table to ensure 100ms response times even with millions of rows.
- **Rate Limiting:** Critical routes (Auth, Payments, Messaging) are protected by **Upstash Redis** sliding window rate limiters.

## 🚀 Getting Started

1.  **Clone and Install**:
    ```bash
    deno install
    ```
2.  **Generate Prisma Client**:
    ```bash
    deno run -A npm:prisma generate
    ```
3.  **Database Setup**: 
    Apply the SQL functions and triggers found in `/supabase/migrations` via the Supabase SQL Editor to enable the automated user provisioning logic.
4.  **Dev Mode**:
    ```bash
    deno task dev
    ```

---
