"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  keyField?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  isLoading = false,
  emptyMessage = "No records found.",
  keyField = "id",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter rows by search
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(lower)
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handlePageSize = (val: number) => {
    setPageSize(val);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Page Size Controls */}
      {searchable && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="datatable-search-input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200
                bg-slate-50 text-slate-700 placeholder-slate-400 outline-none
                focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white
                transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSize(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700
                text-sm outline-none focus:border-emerald-500 cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200" style={{ background: "#F8FAFC" }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16">
                    <LoadingSpinner size="md" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      title={emptyMessage}
                      description={
                        search
                          ? `No results for "${search}". Try a different search term.`
                          : "Nothing here yet."
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((row, rowIdx) => (
                  <tr
                    key={String(row[keyField] ?? rowIdx)}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5 text-slate-700">
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-slate-500">
          {/* Count */}
          <span>
            Showing{" "}
            <span className="font-medium text-slate-700">
              {Math.min((safePage - 1) * pageSize + 1, filtered.length)}–
              {Math.min(safePage * pageSize, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">{filtered.length}</span> results
          </span>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            <PageBtn
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </PageBtn>
            <PageBtn
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </PageBtn>

            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 min-w-[80px] text-center">
              {safePage} / {totalPages}
            </span>

            <PageBtn
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </PageBtn>
            <PageBtn
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center
        text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40
        disabled:cursor-not-allowed transition-all"
      {...rest}
    >
      {children}
    </button>
  );
}
