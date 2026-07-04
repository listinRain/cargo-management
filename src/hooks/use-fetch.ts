"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchOptions {
  /** 是否在组件挂载时自动请求，默认 true */
  immediate?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 通用的数据请求 Hook。
 * 自动管理 loading / error / data 状态，支持手动 refetch。
 */
export function useFetch<T = unknown>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { immediate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else if (json.error) {
        setData(null);
        setError(json.error);
      } else if (res.status === 401 || res.status === 403) {
        setError(json.error || "访问被拒绝");
      } else {
        setError("请求失败");
      }
    } catch {
      setError("网络异常，请检查连接");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 列表分页 Hook，在 useFetch 基础上增加分页控制。
 */
export function useFetchList<T = unknown>(
  baseUrl: string,
  params: Record<string, string> = {},
  options: UseFetchOptions = {}
) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  const query = new URLSearchParams({ ...params, page: String(page), pageSize: String(pageSize) }).toString();
  const url = `${baseUrl}?${query}`;

  const result = useFetch<{ items?: T[] } & Record<string, unknown>>(url, options);

  // 如果 API 返回分页信息，自动提取
  const raw = result.data as Record<string, unknown> | null;
  const items = (Array.isArray(raw) ? raw : (raw as Record<string, unknown>)?.data) as T[] | null;

  useEffect(() => {
    if (raw && typeof raw === "object" && "pagination" in raw) {
      const pag = raw.pagination as { totalPages?: number };
      if (pag?.totalPages) setTotalPages(pag.totalPages);
    }
  }, [raw]);

  return {
    data: items ?? [],
    loading: result.loading,
    error: result.error,
    page,
    totalPages,
    setPage,
    refetch: result.refetch,
    pageSize,
  };
}
