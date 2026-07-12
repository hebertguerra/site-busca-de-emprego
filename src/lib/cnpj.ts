export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

function calculateCnpjCheckDigit(base: string, weights: number[]): number {
  const sum = base
    .split("")
    .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

/** Valida um CNPJ conferindo os dois dígitos verificadores. */
export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value)

  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const firstDigit = calculateCnpjCheckDigit(cnpj.slice(0, 12), firstWeights)
  const secondDigit = calculateCnpjCheckDigit(cnpj.slice(0, 13), secondWeights)

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13])
}

export function formatCnpj(value: string): string {
  const cnpj = onlyDigits(value).slice(0, 14)
  return cnpj
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}
