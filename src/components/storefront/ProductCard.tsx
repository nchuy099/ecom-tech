import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Warehouse } from 'lucide-react';
import { ProductSummaryResponse } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: ProductSummaryResponse;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const isLowStock = product.availableQuantity > 0 && product.availableQuantity <= 5;
  const isOutOfStock = product.availableQuantity <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(
      product,
      {
        variantId: product.variantId,
        variantName: product.variantName,
        sku: product.sku,
        price: product.price,
        imageUrl: product.imageUrl,
        availableQuantity: product.availableQuantity,
      },
      1
    );
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Image & Badges */}
      <div className="relative w-full pt-[85%] bg-zinc-100 dark:bg-zinc-800/60 overflow-hidden">
        <img
          src={
            product.imageUrl ||
            'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'
          }
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <Badge variant="accent" size="sm">
              {product.badge}
            </Badge>
          )}
          {isOutOfStock ? (
            <Badge variant="danger" size="sm">
              Hết hàng
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm">
              Chỉ còn {product.availableQuantity}
            </Badge>
          ) : (
            <Badge variant="brand" size="sm">
              <Check className="w-3 h-3 inline mr-0.5" /> Còn {product.availableQuantity}
            </Badge>
          )}
        </div>

        {/* Multi-warehouse pill */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Warehouse className="w-3 h-3 text-emerald-400" />
          <span>Sẵn sàng tại 3 tổng kho</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
          <span className="font-medium tracking-wide uppercase text-[10px] text-zinc-400 dark:text-zinc-500">
            {product.categoryName || 'Thiết bị cao cấp'}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
              {product.reviewCount && (
                <span className="text-zinc-400 font-normal">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {product.name}
        </h3>

        {/* Variant name & SKU */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
          {product.variantName}
        </p>

        {/* Price and Action */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
          <div>
            <span className="text-xs text-zinc-400 block -mb-0.5">Giá niêm yết</span>
            <span className="text-base font-extrabold text-brand-600 dark:text-brand-400 tracking-tight">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-brand-600 text-white dark:bg-zinc-800 dark:hover:bg-brand-500 dark:hover:text-zinc-950 transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            title="Thêm nhanh vào giỏ"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
