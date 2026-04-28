import Stripe from "stripe";
import { Context } from "hono";
import { envVars } from "../config/env.ts";
import { getSupabase } from "../middleware/supabase_auth_middleware.ts";
import { Prisma } from "../lib/prisma.ts";

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

const createCheckoutSession = async (c: Context) => {
  try {
    const _body = await c.req.json();

    const plan = _body.plan || "annual";
    const amount = plan === "monthly" ? 1500 : 14400; // $15 or $144
    const name =
      plan === "monthly" ? "Explorer Pro (Monthly)" : "Explorer Pro (Annual)";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: name,
              description: "Unlimited trips, priority matching, offline maps.",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment", // "subscription" if you set up a Stripe billing product
      success_url: `${envVars.FRONTEND_HOST}/price/confirm-payment/{CHECKOUT_SESSION_ID}?plan=${plan}`,
      cancel_url: `${envVars.FRONTEND_HOST}/price/cancel-payment/{CHECKOUT_SESSION_ID}`,
    });

    return {
      success: true,
      status: 200,
      data: {
        id: session.id,
        url: session.url,
      },
      message: "Checkout session created successfully",
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      status: 500,
      message: err.message || "Failed to create checkout session",
      data: null,
    };
  }
};

const confirmPayment = async (c: Context) => {
  try {
    const { session_id, plan } = await c.req.json();
    const supabase = getSupabase(c);
    const userId = await supabase.auth.getUser();

    if (!userId.data.user?.id) {
      return {
        success: false,
        status: 401,
        message: "Unauthorized",
        data: null,
      };
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const payment = await Prisma.payments.create({
        data: {
          user_id: userId.data.user.id,
          transaction_id: session.payment_intent
            ? [session.payment_intent as string]
            : [session.id],
          status: session.payment_status,
        },
      });

      await Prisma.profiles.update({
        where: {
          id: userId.data.user.id,
        },
        data: {
          subscription_tier: "Premium",
          subscription_expires_at:
            plan === "monthly"
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          subscription_plan: plan,
        },
      })

      return {
        success: true,
        status: 200,
        data: payment,
        message: "Payment confirmed successfully",
      };
    }

    return {
      success: false,
      status: 400,
      data: null,
      message: "Payment not completed",
    }

  } catch (error: unknown) {

    const err = error as Error;
    return {
      success: false,
      status: 500,
      message: err.message || "Failed to confirm payment",
      data: null,
    };
  }
};

export const paymentService = {
  createCheckoutSession,
  confirmPayment,
};
