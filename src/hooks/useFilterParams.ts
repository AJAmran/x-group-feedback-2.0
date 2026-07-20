"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface FilterValues {
  branch: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  rating: string;
  status: string;
  page: string;
}

export function useFilterParams(basePath?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedBasePath = basePath || pathname;

  const filters: FilterValues = useMemo(() => ({
    branch: searchParams.get("branch") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
    search: searchParams.get("search") || "",
    rating: searchParams.get("rating") || "",
    status: searchParams.get("status") || "",
    page: searchParams.get("page") || "1",
  }), [searchParams]);

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") {
      params.set("page", "1");
    }
    router.push(`${resolvedBasePath}?${params.toString()}`);
  }, [router, searchParams, resolvedBasePath]);

  const setFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    let resetPage = false;
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") resetPage = true;
    }
    if (resetPage) params.set("page", "1");
    router.push(`${resolvedBasePath}?${params.toString()}`);
  }, [router, searchParams, resolvedBasePath]);

  const clearFilters = useCallback(() => {
    router.push(resolvedBasePath);
  }, [router, resolvedBasePath]);

  const hasFilters = useMemo(
    () => filters.branch || filters.dateFrom || filters.dateTo || filters.search || filters.rating || filters.status,
    [filters],
  );

  const filterCount = useMemo(
    () => [filters.branch, filters.dateFrom, filters.dateTo, filters.search, filters.rating, filters.status].filter(Boolean).length,
    [filters],
  );

  const filterKey = useMemo(
    () => `${filters.dateFrom}|${filters.dateTo}|${filters.branch}|${filters.search}|${filters.rating}|${filters.status}|${filters.page}`,
    [filters],
  );

  return { filters, setFilter, setFilters, clearFilters, hasFilters, filterCount, filterKey };
}
