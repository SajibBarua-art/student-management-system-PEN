/**
 * Client-safe transaction reference generator
 */
export function generateTransactionReference(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `TXN-${year}-${randomSuffix}`;
}
