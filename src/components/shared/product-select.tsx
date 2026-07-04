"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export interface ProductOption {
  productId: string;
  productName: string;
  productCode: string;
  unit: string;
  unitPrice: number;
  /** 当前库存中该货物的总量（按选中仓库库位过滤后） */
  stockQuantity: number;
  /** 库存所在的仓库/库位信息 */
  stockDetails: { warehouseName: string; locationName: string; quantity: number }[];
}

interface Props {
  value: string;
  onChange: (productId: string, option: ProductOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableProductSelect({ value, onChange, placeholder = "搜索货物名称或编码...", disabled, className }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductOption[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 首次打开时加载全部库存数据
  const loadData = async () => {
    if (loaded) return;
    setLoading(true);
    const res = await fetch("/api/inventory");
    const d = await res.json();
    if (d.success) {
      // 按 productId 聚合库存数量
      const map = new Map<string, ProductOption>();
      for (const item of d.data as any[]) {
        const pid = item.product.id;
        const existing = map.get(pid);
        if (existing) {
          existing.stockQuantity += item.quantity;
          existing.stockDetails.push({
            warehouseName: item.warehouse.name,
            locationName: item.location.name,
            quantity: item.quantity,
          });
        } else {
          map.set(pid, {
            productId: pid,
            productName: item.product.name,
            productCode: item.product.code,
            unit: item.product.unit,
            unitPrice: item.product.unitPrice,
            stockQuantity: item.quantity,
            stockDetails: [{
              warehouseName: item.warehouse.name,
              locationName: item.location.name,
              quantity: item.quantity,
            }],
          });
        }
      }
      const list = Array.from(map.values());
      setAllProducts(list);
      setResults(list);
    }
    setLoaded(true);
    setLoading(false);
  };

  // 点击外部关闭下拉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (!query.trim()) {
      setResults(allProducts.length > 0 ? allProducts : []);
      return;
    }
    const q = query.toLowerCase();
    setResults(
      allProducts.filter(
        p => p.productName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q)
      ).slice(0, 30)
    );
  }, [query, allProducts]);

  // 已选中的货物信息
  const selected = allProducts.find(p => p.productId === value);

  return (
    <div ref={containerRef} className={className}>
      {value && selected ? (
        // 已选中状态
        <div
          className="flex items-center gap-2 h-9 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:border-primary/50"
          onClick={() => {
            setOpen(true);
            if (!loaded) loadData();
          }}
        >
          <span className="font-medium truncate flex-1">
            {selected.productName}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {selected.productCode} | ¥{selected.unitPrice} | 库存: {selected.stockQuantity} {selected.unit}
          </span>
        </div>
      ) : (
        // 未选择状态 - 搜索框
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8 pr-8 h-9 text-sm"
              placeholder={placeholder}
              value={query}
              disabled={disabled}
              onFocus={() => {
                setOpen(true);
                if (!loaded) loadData();
              }}
              onChange={e => {
                setQuery(e.target.value);
                setOpen(true);
              }}
            />
            {loading && (
              <Loader2 className="absolute right-2.5 top-2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>
      )}

      {/* 下拉列表 */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md border bg-popover shadow-lg">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-sm text-center text-muted-foreground">
              {loading ? "加载中..." : "未找到匹配的货物"}
            </div>
          ) : (
            results.map(p => (
              <div
                key={p.productId}
                className={[
                  "px-3 py-2 cursor-pointer text-sm hover:bg-muted flex items-center justify-between gap-2",
                  p.productId === value ? "bg-primary/10" : "",
                ].join(" ")}
                onClick={() => {
                  onChange(p.productId, p);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.productName}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.productCode} | ¥{p.unitPrice} / {p.unit}
                    {/* 库存分布摘要 */}
                    {p.stockDetails.length <= 2
                      ? p.stockDetails.map(d => (
                          <span key={d.warehouseName + d.locationName} className="ml-2">
                            {d.warehouseName}/{d.locationName}: {d.quantity}
                          </span>
                        ))
                      : <span className="ml-2">共 {p.stockDetails.length} 个库位有货</span>
                    }
                  </div>
                </div>
                <span className={[
                  "text-xs font-bold shrink-0 rounded-full px-2 py-0.5",
                  p.stockQuantity <= 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
                ].join(" ")}>
                  {p.stockQuantity} {p.unit}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
