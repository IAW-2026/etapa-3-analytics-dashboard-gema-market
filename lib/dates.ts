const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeDateFrom(d: string | undefined): string | undefined {
  if (!d) return undefined;
  if (DATE_ONLY.test(d)) return `${d}T00:00:00.000Z`;
  return d;
}

export function normalizeDateTo(d: string | undefined): string | undefined {
  if (!d) return undefined;
  if (DATE_ONLY.test(d)) return `${d}T23:59:59.999Z`;
  return d;
}

export function defaultDateFrom(days = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function defaultDateTo(): string {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString();
}
