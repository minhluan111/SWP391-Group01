export const LIST_PAGE_SIZE = 10;

export interface PaginationResult<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
}

export function paginateList<T>(
  items: T[],
  page: number,
  pageSize = LIST_PAGE_SIZE,
): PaginationResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, total),
  };
}

export function buildPageCounterText(
  page: number,
  rangeStart: number,
  rangeEnd: number,
  total: number,
  unit: string,
  suffix?: string,
): string {
  if (total === 0) {
    return `Trang 1 · 0 / 0 ${unit}${suffix ?? ''}`;
  }
  return `Trang ${page} · ${rangeStart}–${rangeEnd} / ${total} ${unit}${suffix ?? ''}`;
}
