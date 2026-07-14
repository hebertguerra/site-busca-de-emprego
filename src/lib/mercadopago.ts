import "server-only"

import { MercadoPagoConfig } from "mercadopago"

/**
 * Sem MERCADOPAGO_ACCESS_TOKEN configurado (ex: antes de o usuário criar a
 * conta Mercado Pago), retorna null em vez de lançar - quem chama decide a
 * mensagem amigável, igual ao no-op de src/lib/rate-limit.ts.
 */
export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) return null

  return new MercadoPagoConfig({ accessToken })
}
