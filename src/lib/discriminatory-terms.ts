/**
 * Termos que a Lei 9.029/95 proibe usar como criterio de selecao
 * (idade, sexo, raca/cor, estado civil, aparencia, etc). Isto NAO bloqueia
 * a publicacao — apenas sinaliza a vaga para revisao manual do admin em
 * /moderacao, já que falsos positivos são possíveis (ex: "jovem" em outro contexto).
 */
const BLOCKLIST_PATTERNS: RegExp[] = [
  /\bboa\s+apar[eê]ncia\b/i,
  /\bapar[eê]ncia\s+agrad[aá]vel\b/i,
  /\bsexo\s*[:\-]?\s*(masculino|feminino)\b/i,
  /\bsolteir[oa]s?\b/i,
  /\bcasad[oa]s?\s+(apenas|somente|de\s+prefer[eê]ncia)\b/i,
  /\bat[eé]\s+\d{1,2}\s+anos\b/i,
  /\bentre\s+\d{1,2}\s+e\s+\d{1,2}\s+anos\b/i,
  /\bjovem\b/i,
  /\bidade\s+(m[aá]xima|m[ií]nima)\b/i,
  /\brec[eé]m[\s-]?formad[oa]\b/i,
]

export function findDiscriminatoryTerms(text: string): string[] {
  const matches: string[] = []
  for (const pattern of BLOCKLIST_PATTERNS) {
    const match = text.match(pattern)
    if (match) matches.push(match[0])
  }
  return matches
}
