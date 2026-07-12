import "server-only"

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

const redis = hasUpstashConfig ? Redis.fromEnv() : null

const limiters = {
  // 5 tentativas de cadastro/login por IP a cada hora.
  auth: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:auth" })
    : null,
  // 10 candidaturas por IP a cada hora.
  apply: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:apply" })
    : null,
}

type LimiterKey = keyof typeof limiters

/**
 * Retorna { success:false } quando o limite estourou. Sem UPSTASH_* configurado
 * (ex: em desenvolvimento local), sempre permite — não bloqueia o fluxo do MVP.
 */
export async function checkRateLimit(key: LimiterKey, identifier: string) {
  const limiter = limiters[key]
  if (!limiter) return { success: true as const }
  return limiter.limit(identifier)
}
