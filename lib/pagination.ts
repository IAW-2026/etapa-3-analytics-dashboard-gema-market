export const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function parsePageParams(
  sp: { page?: string; page_size?: string },
  defaultSize = 20,
) {
  const page = Math.max(1, Number(sp.page) || 1);
  let pageSize = Number(sp.page_size) || defaultSize;
  if (!PAGE_SIZE_OPTIONS.includes(pageSize)) pageSize = defaultSize;
  return { page, pageSize };
}

export function totalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}
