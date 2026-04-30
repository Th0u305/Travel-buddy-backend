import { Redis } from '@upstash/redis'
import { envVars } from "../config/env.ts";

// Initialize Redis client
const redis = new Redis({
  url: envVars.UPSTASH_REDIS_REST_URL,
  token: envVars.UPSTASH_REDIS_REST_TOKEN,
})

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
  keyPrefix: string     // Redis key prefix
}

// Default configurations
export const RATE_LIMITS = {
  // General API calls
  api: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30,          // 30 requests per minute
    keyPrefix: 'rl:api:',
  },
  
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 attempts per 15 min
    keyPrefix: 'rl:auth:',
  },
  
  // Payment endpoints (very strict)
  payment: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,          // 10 attempts per hour
    keyPrefix: 'rl:payment:',
  },
  
  // Public endpoints (more lenient)
  public: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // 100 requests per minute
    keyPrefix: 'rl:public:',
  },
} as const

// Rate limit result
export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  limit: number
}

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}${identifier}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Use Redis pipeline for atomic operations
  const pipeline = redis.pipeline()
  
  // Remove old entries outside the window
  pipeline.zremrangebyscore(key, 0, windowStart)
  
  // Add current request
  pipeline.zadd(key, { score: now, member: `${now}-${crypto.randomUUID()}` })
  
  // Count requests in current window
  pipeline.zcard(key)
  
  // Set expiry on the key
  pipeline.expire(key, Math.ceil(config.windowMs / 1000))
  
  // Execute all commands
  const results = await pipeline.exec()
  
  // Get current count (3rd result from zcard)
  const currentCount = results[2] as number
  const remaining = Math.max(0, config.maxRequests - currentCount)
  const reset = now + config.windowMs

  return {
    success: currentCount <= config.maxRequests,
    remaining,
    reset,
    limit: config.maxRequests,
  }
}

/**
 * Get rate limit info without incrementing
 */
export async function getRateLimitInfo(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}${identifier}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Clean old entries
  await redis.zremrangebyscore(key, 0, windowStart)
  
  // Count current requests
  const currentCount = await redis.zcard(key)
  const remaining = Math.max(0, config.maxRequests - currentCount)
  const reset = now + config.windowMs

  return {
    success: currentCount <= config.maxRequests,
    remaining,
    reset,
    limit: config.maxRequests,
  }
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<void> {
  const key = `${config.keyPrefix}${identifier}`
  await redis.del(key)
}

export { redis }