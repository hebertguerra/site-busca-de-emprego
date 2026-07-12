import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/types/database.types"

// "/empresa" cobre tanto /empresa/painel quanto /empresa/perfil, /empresa/vagas etc.
// O painel do candidato fica em "/painel" (sem prefixo) para nao colidir com o da empresa.
const ROLE_PREFIXES: Record<string, string> = {
  "/painel": "candidato",
  "/perfil": "candidato",
  "/minhas-candidaturas": "candidato",
  "/empresa": "empresa",
  "/moderacao": "admin",
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  )

  if (protectedPrefix) {
    if (!user) {
      const redirectUrl = new URL("/entrar", request.url)
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    const requiredRole = ROLE_PREFIXES[protectedPrefix]
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== requiredRole) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
}
