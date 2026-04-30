import { Context, Next } from 'hono'
import { checkRateLimit, RATE_LIMITS, RateLimitConfig } from '../lib/rate-limiter.ts'

type Variables = {
  rateLimit?: {
    remaining: number
    limit: number
    reset: number
  }
}

export type AppContext = Context<{ Variables: Variables }>

interface RateLimitOptions {
  config: RateLimitConfig
  getKey?: (c: AppContext) => string
  onLimitExceeded?: (c: AppContext) => Response
}

export function rateLimit(options: RateLimitOptions) {
  return async (c: AppContext, next: Next) => {
    const { config, getKey, onLimitExceeded } = options

    // Get identifier (IP, user ID, etc.)
    const identifier = getKey 
      ? getKey(c) 
      : c.req.header('x-forwarded-for') || 
        c.req.header('x-real-ip') || 
        'anonymous'

    // Check rate limit
    const result = await checkRateLimit(identifier, config)

    // Set rate limit headers
    c.set('rateLimit', {
      remaining: result.remaining,
      limit: result.limit,
      reset: result.reset,
    })

    c.header('X-RateLimit-Limit', result.limit.toString())
    c.header('X-RateLimit-Remaining', result.remaining.toString())
    c.header('X-RateLimit-Reset', result.reset.toString())

    // Handle rate limit exceeded
    if (!result.success) {
      c.header('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString())

      if (onLimitExceeded) {
        return onLimitExceeded(c)
      }

      return c.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        429
      )
    }

    await next()
  }
}

// Pre-configured middleware presets
export const rateLimitPresets = {
  // General API rate limiting
  api: rateLimit({ config: RATE_LIMITS.api }),
  
  // Auth endpoints (login, signup, etc.)
  auth: rateLimit({ config: RATE_LIMITS.auth }),
  
  // Payment endpoints
  payment: rateLimit({ config: RATE_LIMITS.payment }),
  
  // Public endpoints
  public: rateLimit({ config: RATE_LIMITS.public }),
  
  // Per-user rate limiting (requires auth middleware)
  user: rateLimit({config: RATE_LIMITS.api}),
  
  // Per-IP rate limiting
  ip: rateLimit({
    config: RATE_LIMITS.api,
    getKey: (c) => c.req.header('x-forwarded-for') || 'unknown',
  }),
}