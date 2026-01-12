/**
 * Generates a unique reference code in the format: VIS-YYYY-XXXXX
 * Example: VIS-2024-A3F9K
 */
export function generateReference(): string {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars

  let randomCode = ''
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    randomCode += chars[randomIndex]
  }

  return `VIS-${year}-${randomCode}`
}
