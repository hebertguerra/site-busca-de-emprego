import { redirect } from "next/navigation"
import { Briefcase, Camera, FileText, GraduationCap, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { AvatarUploader } from "@/components/shared/avatar-uploader"
import { ResumeUploader } from "@/components/shared/resume-uploader"
import { CandidateProfileForm } from "@/components/forms/candidate-profile-form"
import { ExperienceSection } from "@/components/forms/experience-section"
import { EducationSection } from "@/components/forms/education-section"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Meu perfil" }

function Section({
  icon: Icon,
  title,
  delayClass,
  children,
}: {
  icon: LucideIcon
  title: string
  delayClass?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both rounded-2xl border bg-card p-5 shadow-sm ${delayClass ?? ""}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/entrar?redirect=/perfil")

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", user.id)
    .single()

  const [{ data: experiences }, { data: education }] = await Promise.all([
    supabase
      .from("candidate_experiences")
      .select("*")
      .eq("candidate_id", user.id)
      .order("start_date", { ascending: false }),
    supabase
      .from("candidate_education")
      .select("*")
      .eq("candidate_id", user.id)
      .order("start_year", { ascending: false }),
  ])

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Meu perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Complete seu perfil para aumentar suas chances nas vagas.
      </p>

      <div className="mt-6 grid gap-4">
        <Section icon={Camera} title="Foto">
          <AvatarUploader userId={user.id} currentUrl={candidate?.photo_url ?? null} />
        </Section>

        <Section icon={FileText} title="Currículo (PDF)" delayClass="delay-75">
          <ResumeUploader userId={user.id} currentUrl={candidate?.resume_file_url ?? null} />
        </Section>

        <Section icon={UserRound} title="Dados do perfil" delayClass="delay-100">
          <CandidateProfileForm candidate={candidate ?? null} />
        </Section>

        <Section icon={Briefcase} title="Experiência profissional" delayClass="delay-150">
          <ExperienceSection experiences={experiences ?? []} />
        </Section>

        <Section icon={GraduationCap} title="Formação e cursos" delayClass="delay-200">
          <EducationSection education={education ?? []} />
        </Section>
      </div>
    </div>
  )
}
