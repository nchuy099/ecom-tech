import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Loader2, PackageSearch } from 'lucide-react';
import { ProductSummaryResponse } from '../../types';
import { ecommerceService } from '../../services/ecommerceService';
import { formatCurrency } from '../../utils/format';

interface SearchSuggestionsProps {
  keyword: string;
  isOpen: boolean;
  onSelectProduct: (product: ProductSummaryResponse) => void;
  onViewAll: (keyword: string) => void;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  keyword,
  isOpen,
  onSelectProduct,
  onViewAll,
  className = '',
}) => {
  const [suggestions, setSuggestions] = useState<ProductSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const normalizedKeyword = useMemo(() => keyword.trim(), [keyword]);
  const shouldShow = isOpen && normalizedKeyword.length >= 2;

  useEffect(() => {
    if (!shouldShow) {
      setSuggestions([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setHasError(false);

    const timeoutId = window.setTimeout(() => {
      ecommerceService
        .getProducts({
          keyword: normalizedKeyword,
          size: 6,
        })
        .then(page => {
          if (!isActive) return;
          setSuggestions(page.items);
        })
        .catch(() => {
          if (!isActive) return;
          setSuggestions([]);
          setHasError(true);
        })
        .finally(() => {
          if (!isActive) return;
          setIsLoading(false);
        });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [normalizedKeyword, shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="max-h-[420px] overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center gap-2 px-3 py-3 text-xs font-medium text-zinc-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Đang tìm sản phẩm...</span>
          </div>
        ) : hasError ? (
          <div className="px-3 py-3 text-xs text-zinc-500">Chưa tải được gợi ý.</div>
        ) : suggestions.length === 0 ? (
          <div className="flex items-center gap-2 px-3 py-3 text-xs text-zinc-500">
            <PackageSearch className="h-4 w-4" />
            <span>Không tìm thấy sản phẩm phù hợp.</span>
          </div>
        ) : (
          <div className="space-y-1">
            {suggestions.map(product => {
              const isOutOfStock = product.availableQuantity <= 0;

              return (
                <button
                  key={product.variantId}
                  type="button"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => onSelectProduct(product)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <img
                    src={
                      product.imageUrl ||
                      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=120&q=80'
                    }
                    alt={product.name}
                    className="h-11 w-11 shrink-0 rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {product.name}
                    </p>
                    <p className="truncate text-[11px] text-zinc-500">{product.variantName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">
                        {formatCurrency(product.price)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isOutOfStock ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isOutOfStock ? 'Hết hàng' : `Còn ${product.availableQuantity}`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onMouseDown={event => event.preventDefault()}
        onClick={() => onViewAll(normalizedKeyword)}
        className="flex w-full items-center justify-center gap-2 border-t border-zinc-100 px-3 py-2.5 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-50 dark:border-zinc-800 dark:text-brand-400 dark:hover:bg-brand-950/30"
      >
        <span>Xem tất cả kết quả cho “{normalizedKeyword}”</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
