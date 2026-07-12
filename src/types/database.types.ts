/**
 * Tipos escritos manualmente a partir de supabase/migrations/0001_init.sql.
 * Assim que o projeto Supabase remoto existir, substituir por:
 *   supabase gen types typescript --project-id <ref> --schema public > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProfileRole = "candidato" | "empresa" | "admin"

export type JobStatus =
  | "rascunho"
  | "pendente_aprovacao"
  | "publicada"
  | "pausada"
  | "encerrada"
  | "rejeitada"

export type ContractType = "CLT" | "PJ" | "estagio" | "temporario" | "freelance"
export type WorkplaceType = "presencial" | "remoto" | "hibrido"
export type EconomicSector =
  | "agronegocio"
  | "turismo"
  | "comercio_servicos"
  | "industria_construcao"
  | "outro"
export type EmploymentType = "formal" | "informal" | "autonomo"

export type ApplicationStatus =
  | "enviada"
  | "em_analise"
  | "entrevista"
  | "aprovado"
  | "rejeitado"
  | "desistiu"

export type ReportStatus = "aberto" | "em_analise" | "resolvido" | "arquivado"
export type ConsentType = "cadastro" | "foto" | "curriculo" | "cookies"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: ProfileRole
          full_name: string | null
          phone: string | null
          consent_lgpd_accepted_at: string | null
          consent_version: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: ProfileRole
          full_name?: string | null
          phone?: string | null
          consent_lgpd_accepted_at?: string | null
          consent_version?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
        Relationships: []
      }
      candidates: {
        Row: {
          id: string
          photo_url: string | null
          headline: string | null
          bio: string | null
          city: string | null
          state: string
          whatsapp: string | null
          resume_file_url: string | null
          resume_updated_at: string | null
          skills: string[]
          desired_contract_types: string[]
          profile_visibility: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          photo_url?: string | null
          headline?: string | null
          bio?: string | null
          city?: string | null
          state?: string
          whatsapp?: string | null
          resume_file_url?: string | null
          resume_updated_at?: string | null
          skills?: string[]
          desired_contract_types?: string[]
          profile_visibility?: boolean
          deleted_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["candidates"]["Insert"]>
        Relationships: []
      }
      candidate_experiences: {
        Row: {
          id: string
          candidate_id: string
          company_name: string
          role_title: string
          start_date: string | null
          end_date: string | null
          is_current: boolean
          description: string | null
          employment_type: EmploymentType
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          company_name: string
          role_title: string
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          employment_type?: EmploymentType
        }
        Update: Partial<Database["public"]["Tables"]["candidate_experiences"]["Insert"]>
        Relationships: []
      }
      candidate_education: {
        Row: {
          id: string
          candidate_id: string
          institution: string
          degree: string | null
          field_of_study: string | null
          start_year: number | null
          end_year: number | null
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          institution: string
          degree?: string | null
          field_of_study?: string | null
          start_year?: number | null
          end_year?: number | null
        }
        Update: Partial<Database["public"]["Tables"]["candidate_education"]["Insert"]>
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          trade_name: string
          legal_name: string | null
          cnpj: string
          logo_url: string | null
          description: string | null
          website: string | null
          city: string | null
          state: string | null
          verified: boolean
          plan_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          trade_name: string
          legal_name?: string | null
          cnpj: string
          logo_url?: string | null
          description?: string | null
          website?: string | null
          city?: string | null
          state?: string | null
          verified?: boolean
          plan_tier?: string
        }
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          requirements: string | null
          benefits: string | null
          contract_type: ContractType
          workplace_type: WorkplaceType
          city: string | null
          state: string
          salary_min: number | null
          salary_max: number | null
          salary_is_public: boolean
          status: JobStatus
          rejection_reason: string | null
          is_featured: boolean
          economic_sector: EconomicSector | null
          required_skills: string[]
          suggested_qualification: string | null
          published_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          requirements?: string | null
          benefits?: string | null
          contract_type: ContractType
          workplace_type: WorkplaceType
          city?: string | null
          state?: string
          salary_min?: number | null
          salary_max?: number | null
          salary_is_public?: boolean
          status?: JobStatus
          rejection_reason?: string | null
          is_featured?: boolean
          economic_sector?: EconomicSector | null
          required_skills?: string[]
          suggested_qualification?: string | null
          published_at?: string | null
          expires_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          status: ApplicationStatus
          cover_note: string | null
          resume_snapshot_url: string | null
          applied_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          status?: ApplicationStatus
          cover_note?: string | null
          resume_snapshot_url?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>
        Relationships: []
      }
      application_status_history: {
        Row: {
          id: string
          application_id: string
          old_status: string | null
          new_status: string
          changed_by: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          application_id: string
          old_status?: string | null
          new_status: string
          changed_by?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["application_status_history"]["Insert"]>
        Relationships: []
      }
      data_access_log: {
        Row: {
          id: string
          accessed_by: string
          candidate_id: string
          accessed_at: string
          context: string | null
        }
        Insert: {
          id?: string
          accessed_by: string
          candidate_id: string
          context?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["data_access_log"]["Insert"]>
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string | null
          job_id: string | null
          company_id: string | null
          reason: string
          description: string | null
          status: ReportStatus
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          job_id?: string | null
          company_id?: string | null
          reason: string
          description?: string | null
          status?: ReportStatus
        }
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>
        Relationships: []
      }
      consent_log: {
        Row: {
          id: string
          profile_id: string
          consent_type: ConsentType
          accepted: boolean
          version: string
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          consent_type: ConsentType
          accepted: boolean
          version: string
          ip_address?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["consent_log"]["Insert"]>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
