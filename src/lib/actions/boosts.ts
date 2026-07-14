"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Preference } from "mercadopago"

import { BOOST_PLANS, createBoostSchema } from "@/lib/validations/boost"
import { getMercadoPagoClient } from "@/lib/mercadopago"
import { createClient } from "@/lib/supabase/server"

export type ActionState = { error?: string } | undefined

export async function createJobBoostCheckout(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = createBoostSchema.safeParse({
    jobId: formData.get("jobId"),
    tier: formData.get("tier"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const mpClient = getMercadoPagoClient()
  if (!mpClient) {
    return {
      error:
        "Pagamentos ainda não configurados neste ambiente. Configure MERCADOPAGO_ACCESS_TOKEN para habilitar vagas em destaque.",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Sessão expirada. Entre novamente." }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, company_id, status")
    .eq("id", parsed.data.jobId)
    .single()

  if (!job || job.company_id !== user.id) {
    return { error: "Vaga não encontrada." }
  }
  if (job.status !== "publicada") {
    return { error: "Só é possível destacar vagas já publicadas." }
  }

  const plan = BOOST_PLANS[parsed.data.tier]

  const { data: boost, error: insertError } = await supabase
    .from("job_boosts")
    .insert({
      job_id: job.id,
      company_id: user.id,
      tier: parsed.data.tier,
      duration_days: plan.durationDays,
      price_cents: plan.priceCents,
    })
    .select("id, external_reference")
    .single()

  if (insertError || !boost) {
    return { error: "Não foi possível iniciar o pagamento. Tente novamente." }
  }

  const headerList = await headers()
  const host = headerList.get("host")
  const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https"
  const origin = `${protocol}://${host}`

  let initPoint: string | undefined

  try {
    const preference = await new Preference(mpClient).create({
      body: {
        items: [
          {
            id: boost.id,
            title: `Destaque de vaga (${plan.label}): ${job.title}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: plan.priceCents / 100,
          },
        ],
        external_reference: boost.external_reference,
        notification_url: `${origin}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${origin}/empresa/vagas`,
          pending: `${origin}/empresa/vagas`,
          failure: `${origin}/empresa/vagas`,
        },
        auto_return: "approved",
      },
    })
    initPoint = preference.init_point
  } catch {
    return { error: "Não foi possível iniciar o pagamento no Mercado Pago. Tente novamente." }
  }

  if (!initPoint) {
    return { error: "Não foi possível gerar o link de pagamento. Tente novamente." }
  }

  // Fora do try/catch: redirect() lanca um erro especial do Next.js que nao
  // deve ser interceptado por um catch genérico.
  redirect(initPoint)
}
