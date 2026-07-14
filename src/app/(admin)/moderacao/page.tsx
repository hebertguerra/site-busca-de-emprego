import { AlertTriangle, Building2, ClipboardCheck, Sparkles } from "lucide-react"

import { ModerationActions } from "@/components/forms/moderation-actions"
import { createAdminClient } from "@/lib/supabase/admin"

export const metadata = { title: "Moderação" }
// A pagina so usa o cliente admin (sem cookies()), entao o Next nao a marca
// como dinamica automaticamente - forcamos, ja que o conteudo e sempre ao vivo.
export const dynamic = "force-dynamic"

export default async function ModeracaoPage() {
  const admin = createAdminClient()

  const [{ data: pendingJobs }, { data: openReports }, { data: unverifiedCompanies }, { data: activeBoosts }] =
    await Promise.all([
      admin
        .from("jobs")
        .select("id, title, description, city, state, companies(trade_name)")
        .eq("status", "pendente_aprovacao")
        .order("created_at", { ascending: true })
        .overrideTypes<
          Array<{
            id: string
            title: string
            description: string
            city: string | null
            state: string
            companies: { trade_name: string } | null
          }>,
          { merge: false }
        >(),
      admin
        .from("reports")
        .select("id, reason, description, job_id, company_id, created_at")
        .eq("status", "aberto")
        .order("created_at", { ascending: true })
        .overrideTypes<
          Array<{
            id: string
            reason: string
            description: string | null
            job_id: string | null
            company_id: string | null
            created_at: string
          }>,
          { merge: false }
        >(),
      admin
        .from("companies")
        .select("id, trade_name, cnpj, created_at")
        .eq("verified", false)
        .order("created_at", { ascending: true })
        .overrideTypes<
          Array<{ id: string; trade_name: string; cnpj: string; created_at: string }>,
          { merge: false }
        >(),
      admin
        .from("job_boosts")
        .select("id, tier, price_cents, paid_at, jobs(title), companies(trade_name)")
        .eq("status", "pago")
        .order("paid_at", { ascending: false })
        .limit(20)
        .overrideTypes<
          Array<{
            id: string
            tier: string
            price_cents: number
            paid_at: string | null
            jobs: { title: string } | null
            companies: { trade_name: string } | null
          }>,
          { merge: false }
        >(),
    ])

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Moderação</h1>

      <section className="mt-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <ClipboardCheck className="size-4" />
          </span>
          <h2 className="text-lg font-semibold">Vagas aguardando aprovação</h2>
        </div>
        {(pendingJobs?.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma vaga pendente.</p>
        )}
        <div className="mt-3 grid gap-3">
          {pendingJobs?.map((job, index) => {
            const company = job.companies
            return (
              <div
                key={job.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both rounded-2xl border bg-card p-4 shadow-sm"
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">
                  {company?.trade_name} · {job.city}/{job.state}
                </p>
                <p className="mt-2 line-clamp-3 text-sm">{job.description}</p>
                <div className="mt-3">
                  <ModerationActions jobId={job.id} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
            <AlertTriangle className="size-4" />
          </span>
          <h2 className="text-lg font-semibold">Denúncias abertas</h2>
        </div>
        {(openReports?.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma denúncia aberta.</p>
        )}
        <div className="mt-3 grid gap-3">
          {openReports?.map((report) => (
            <div key={report.id} className="rounded-2xl border bg-card p-4 text-sm shadow-sm">
              <p className="font-medium">{report.reason}</p>
              {report.description && <p className="text-muted-foreground">{report.description}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </span>
          <h2 className="text-lg font-semibold">Empresas não verificadas</h2>
        </div>
        {(unverifiedCompanies?.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma empresa pendente de verificação.</p>
        )}
        <div className="mt-3 grid gap-2">
          {unverifiedCompanies?.map((company) => (
            <div key={company.id} className="rounded-xl border bg-card p-3 text-sm shadow-sm">
              {company.trade_name} — {company.cnpj}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Sparkles className="size-4" />
          </span>
          <h2 className="text-lg font-semibold">Destaques pagos (últimos 20)</h2>
        </div>
        {(activeBoosts?.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">Nenhum destaque pago ainda.</p>
        )}
        <div className="mt-3 grid gap-2">
          {activeBoosts?.map((boost) => (
            <div
              key={boost.id}
              className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm shadow-sm"
            >
              <div>
                <span className="font-medium">{boost.jobs?.title}</span>
                <span className="text-muted-foreground"> — {boost.companies?.trade_name}</span>
              </div>
              <span className="text-muted-foreground">
                {boost.tier.replace("_", " ")} ·{" "}
                {(boost.price_cents / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
