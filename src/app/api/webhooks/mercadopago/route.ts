import { NextResponse, type NextRequest } from "next/server"
import { Payment, WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago"

import { getMercadoPagoClient } from "@/lib/mercadopago"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  const mpClient = getMercadoPagoClient()

  if (!webhookSecret || !mpClient) {
    // Ainda nao configurado neste ambiente - nao ha como validar a
    // autenticidade do webhook, entao nem tentamos processar.
    return NextResponse.json({ error: "not_configured" }, { status: 503 })
  }

  const dataId = request.nextUrl.searchParams.get("data.id")

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret: webhookSecret,
      toleranceSeconds: 300,
    })
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      return NextResponse.json({ error: err.reason }, { status: 401 })
    }
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 })
  }

  if (!dataId) {
    return NextResponse.json({ error: "missing_data_id" }, { status: 400 })
  }

  // Nunca confiar no corpo do webhook: buscamos o pagamento direto na API
  // do Mercado Pago para confirmar o status real.
  const payment = await new Payment(mpClient).get({ id: dataId })

  if (payment.status === "approved" && payment.external_reference) {
    const admin = createAdminClient()
    await admin
      .from("job_boosts")
      .update({ status: "pago", paid_at: new Date().toISOString() })
      .eq("external_reference", payment.external_reference)
      .eq("status", "pendente")
  }

  return NextResponse.json({ received: true })
}
