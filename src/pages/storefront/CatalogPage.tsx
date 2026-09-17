import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  RotateCcw,
  Check,
  ChevronDown,
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../services/mockData';
import { ProductCard } from '../../components/storefront/ProductCard';
import { formatCurrency } from '../../utils/format';
import { Button } from '../../components/ui/Button';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [keyword, setKeyword] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(60000000);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [isGridView, setIsGridView] = useState(true);

  // Sync state if url changes
  React.useEffect(() => {
    if (queryParam) setKeyword(queryParam);
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [queryParam, categoryParam]);

  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.variantName.toLowerCase().includes(q)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    if (inStockOnly) {
      result = result.filter(p => p.availableQuantity > 0);
    }

    result = result.filter(p => p.price <= maxPrice);

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [keyword, selectedCategory, inStockOnly, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory('all');
    setInStockOnly(false);
    setMaxPrice(60000000);
    setSortBy('default');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Danh Mục & Tìm Kiếm Sản Phẩm
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Hỗ trợ tìm kiếm theo từ khóa, lọc theo danh mục, khoảng giá và tối ưu phân trang Keyset cursor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                <span>Bộ Lọc Nâng Cao</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-zinc-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Keyword search in filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Từ khóa
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="MacBook, Titan, Sony..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Categories filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Ngành hàng
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>Tất cả ngành hàng</span>
                  {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
                </button>
                {MOCK_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-bold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Mức giá tối đa
                </label>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {formatCurrency(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={4000000}
                max={60000000}
                step={1000000}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>{formatCurrency(4000000)}</span>
                <span>{formatCurrency(60000000)}</span>
              </div>
            </div>

            {/* In stock toggle */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Chỉ hiện sản phẩm còn hàng
              </span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 accent-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>
        </aside>

        {/* Right Product Grid and Top Toolbar */}
        <main className="lg:col-span-3 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="text-xs text-zinc-500">
              Tìm thấy{' '}
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {filteredProducts.length}
              </span>{' '}
              sản phẩm phù hợp
            </div>

            <div className="flex items-center gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span>Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="default">Phổ biến nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>

              {/* View layout toggle */}
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl p-0.5 bg-zinc-50 dark:bg-zinc-800">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isGridView
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                  title="Xem dạng lưới"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    !isGridView
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                  title="Xem dạng danh sách"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                Không tìm thấy sản phẩm nào
              </p>
              <p className="text-xs text-zinc-500">
                Vui lòng thử điều chỉnh lại mức giá hoặc từ khóa tìm kiếm.
              </p>
              <Button size="sm" onClick={handleResetFilters}>
                Đặt lại bộ lọc
              </Button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                isGridView
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Keyset Cursor Load More */}
          {filteredProducts.length > 0 && (
            <div className="pt-8 text-center">
              <Button
                variant="outline"
                size="md"
                className="font-mono text-xs"
              >
                Tải Thêm Sản Phẩm (Cursor Keyset Pagination)
              </Button>
              <p className="text-[11px] text-zinc-400 mt-2">
                Trang được tối ưu hóa chỉ mục SQL `idx_product_cursor` tránh suy giảm hiệu năng OFFSET
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
