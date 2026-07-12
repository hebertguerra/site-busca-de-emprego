import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { ApplyButton } from "@/components/shared/apply-button"
import { ReportJobDialog } from "@/components/shared/report-job-dialog"
import { createClient } from "@/lib/supabase/server"
import type { EconomicSector } from "@/types/database.types"

const CONTRACT_LABELS: Record<string, string> = {
  CLT: "CLT",
  PJ: "PJ",
  estagio: "Estágio",
  temporario: "Temporário",
  freelance: "Freelance",
}

const WORKPLACE_LABELS: Record<string, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
}

const SECTOR_LABELS: Record<EconomicSector, string> = {
  agronegocio: "Agronegócio",
  turismo: "Turismo",
  comercio_servicos: "Comércio e serviços",
  industria_construcao: "Indústria e construção",
  outro: "Outro",
}

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from("jobs")
    .select("title, city, state, description")
    .eq("id", id)
    .single()

  if (!job) return {}

  const title = `${job.title}${job.city ? ` - ${job.city}/${job.state}` : ""}`
  const description = job.description.slice(0, 150)

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  }
}

export default async function VagaDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, title, description, requirements, benefits, contract_type, workplace_type, city, state, salary_min, salary_max, salary_is_public, economic_sector, required_skills, suggested_qualification, companies(trade_name, city, state)"
    )
    .eq("id", id)
    .single()
    .overrideTypes<{
      id: string
      title: string
      description: string
      requirements: string | null
      benefits: string | null
      contract_type: string
      workplace_type: string
      city: string | null
      state: string
      salary_min: number | null
      salary_max: number | null
      salary_is_public: boolean
      economic_sector: EconomicSector | null
      required_skills: string[]
      suggested_qualification: string | null
      companies: { trade_name: string; city: string | null; state: string | null } | null
    }, { merge: false }>()

  if (!job) {
    notFound()
  }

  const company = job.companies

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let missingSkills: string[] = []
  if (user && job.required_skills.length > 0) {
    const { data: candidate } = await supabase
      .from("candidates")
      .select("skills")
      .eq("id", user.id)
      .single()

    const candidateSkills = new Set(
      (candidate?.skills ?? []).map((skill) => skill.trim().toLowerCase())
    )
    missingSkills = job.required_skills.filter(
      (skill) => !candidateSkills.has(skill.trim().toLowerCase())
    )
  }

  const shareText = encodeURIComponent(
    `Vaga: ${job.title}${job.city ? ` (${job.city}/${job.state})` : ""} - confira no Vagas Piauí`
  )

  const headerList = await headers()
  const host = headerList.get("host")
  const protocol = host?.startsWith("localhost") ? "http" : "https"
  const pageUrl = host ? `${protocol}://${host}/vagas/${job.id}` : ""

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {CONTRACT_LABELS[job.contract_type] ?? job.contract_type}
        </Badge>
        <Badge variant="outline">
          {WORKPLACE_LABELS[job.workplace_type] ?? job.workplace_type}
        </Badge>
        {job.economic_sector && (
          <Badge variant="outline">{SECTOR_LABELS[job.economic_sector]}</Badge>
        )}
      </div>

      <h1 className="mt-3 text-2xl font-bold">{job.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {company?.trade_name}
        {job.city ? ` · ${job.city}/${job.state}` : ""}
      </p>

      {job.salary_is_public && (job.salary_min || job.salary_max) && (
        <p className="mt-2 text-sm font-medium">
          Salário: R$ {job.salary_min ?? "—"} {job.salary_max ? `a R$ ${job.salary_max}` : ""}
        </p>
      )}

      <div className="prose prose-sm mt-6 max-w-none whitespace-pre-line">
        <h2 className="text-base font-semibold">Descrição</h2>
        <p>{job.description}</p>

        {job.requirements && (
          <>
            <h2 className="text-base font-semibold">Requisitos</h2>
            <p>{job.requirements}</p>
          </>
        )}

        {job.benefits && (
          <>
            <h2 className="text-base font-semibold">Benefícios</h2>
            <p>{job.benefits}</p>
          </>
        )}
      </div>

      {job.required_skills.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-semibold">Habilidades desejadas</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {job.required_skills.map((skill) => (
              <Badge
                key={skill}
                variant={missingSkills.includes(skill) ? "outline" : "secondary"}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {user && missingSkills.length > 0 && job.suggested_qualification && (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium">
            Você ainda não indicou {missingSkills.length === 1 ? "essa habilidade" : "essas habilidades"} no
            seu perfil: {missingSkills.join(", ")}.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Caminho sugerido pela empresa: {job.suggested_qualification}
          </p>
        </div>
      )}

      <div className="sticky bottom-4 mt-8 flex flex-col gap-3 rounded-lg border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <ApplyButton jobId={job.id} />
        <a
          href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline"
        >
          Compartilhar no WhatsApp
        </a>
      </div>

      <div className="mt-3 text-right">
        <ReportJobDialog jobId={job.id} />
      </div>
    </div>
  )
}
