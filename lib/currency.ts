/**
 * Format amount to Taiwan Dollar (TWD) currency format
 * @param amount - The amount to format
 * @returns Formatted string in "NT$X,XXX" format
 */
export function formatTWD(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format amount to Taiwan Dollar with abbreviated notation
 * @param amount - The amount to format
 * @returns Formatted string without decimal places
 */
export function formatTWDShort(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
