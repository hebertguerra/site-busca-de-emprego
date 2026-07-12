import { ModerationActions } from "@/components/forms/moderation-actions"
import { createAdminClient } from "@/lib/supabase/admin"

export const metadata = { title: "Moderação" }
// A pagina so usa o cliente admin (sem cookies()), entao o Next nao a marca
// como dinamica automaticamente - forcamos, ja que o conteudo e sempre ao vivo.
export const dynamic = "force-dynamic"

export default async function ModeracaoPage() {
  const admin = createAdminClient()

  const [{ data: pendingJobs }, { data: openReports }, { data: unverifiedCompanies }] =
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
    ])

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Moderação</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Vagas aguardando aprovação</h2>
        {(pendingJobs?.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma vaga pendente.</p>
        )}
        <div className="mt-3 grid gap-3">
          {pendingJobs?.map((job) => {
            const company = job.companies
            return (
              <div key={job.id} className="rounded-lg border p-4">
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
        <h2 className="text-lg font-semibold">Denúncias abertas</h2>
        {(openReports?.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma denúncia aberta.</p>
        )}
        <div className="mt-3 grid gap-3">
          {openReports?.map((report) => (
            <div key={report.id} className="rounded-lg border p-4 text-sm">
              <p className="font-medium">{report.reason}</p>
              {report.description && <p className="text-muted-foreground">{report.description}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Empresas não verificadas</h2>
        {(unverifiedCompanies?.length ?? 0) === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma empresa pendente de verificação.</p>
        )}
        <div className="mt-3 grid gap-2">
          {unverifiedCompanies?.map((company) => (
            <div key={company.id} className="rounded-lg border p-3 text-sm">
              {company.trade_name} — {company.cnpj}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
