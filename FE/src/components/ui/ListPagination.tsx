import { LIST_PAGE_SIZE } from '../../lib/pagination';

interface ListPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function ListPagination({
  page,
  totalPages,
  onPageChange,
  className = '',
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-3 pt-4 ${className}`}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ‹ Trước
      </button>
      <span className="text-xs text-slate-500 font-medium min-w-[4.5rem] text-center">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Sau ›
      </button>
    </div>
  );
}

export { LIST_PAGE_SIZE };
