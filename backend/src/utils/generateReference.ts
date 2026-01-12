/**
 * Generates a unique reference for a report in the format: VIS-YEAR-XXXXXX
 * Example: VIS-2024-A3F8K9
 *
 * @returns A unique reference string
 */
export function generateReference(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';

  // Generate 6 random alphanumeric characters
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `VIS-${year}-${randomPart}`;
}

/**
 * Validates if a reference matches the expected format
 *
 * @param reference - The reference string to validate
 * @returns True if valid, false otherwise
 */
export function isValidReference(reference: string): boolean {
  const pattern = /^VIS-\d{4}-[A-Z0-9]{6}$/;
  return pattern.test(reference);
}
