import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Warehouse,
  Info,
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_PRODUCT_DETAILS, MOCK_WAREHOUSES } from '../../services/mockData';
import { ProductVariantDetailResponse } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useCart } from '../../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  const variants: ProductVariantDetailResponse[] =
    MOCK_PRODUCT_DETAILS[product.id] || [
      {
        productId: product.id,
        productName: product.name,
        variantId: product.variantId,
        sku: product.sku,
        variantName: product.variantName,
        price: product.price,
        availableQuantity: product.availableQuantity,
        reservedQuantity: product.reservedQuantity,
        imageUrl: product.imageUrl,
        description: 'Sản phẩm cao cấp phân phối chính hãng kèm chế độ bảo hành vàng.',
      },
    ];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDetailResponse>(variants[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'warehouses'>('desc');
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariant(variants[0]);
      setQuantity(1);
    }
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    navigate('/checkout');
  };

  const isOutOfStock = selectedVariant.availableQuantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          {product.categoryName || 'Sản phẩm'}
        </Link>
        <span>/</span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <img
              src={selectedVariant.imageUrl || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant="accent" size="md">
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails of variants */}
          {variants.length > 1 && (
            <div className="flex gap-3">
              {variants.map(v => (
                <button
                  key={v.variantId}
                  onClick={() => setSelectedVariant(v)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                    selectedVariant.variantId === v.variantId
                      ? 'border-brand-500 ring-2 ring-brand-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={v.imageUrl || product.imageUrl}
                    alt={v.variantName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Variant Picker */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                {product.categoryName}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating || 4.9}</span>
                <span className="text-zinc-400 font-normal">({product.reviewCount || 120} đánh giá)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500">SKU: {selectedVariant.sku}</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <button
                onClick={() => setIsWarehouseModalOpen(true)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>Tra cứu tồn kho 3 tổng kho</span>
              </button>
            </div>
          </div>

          {/* Price & Stock status */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 block">Giá bán ưu đãi</span>
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
                {formatCurrency(selectedVariant.price)}
              </span>
            </div>

            <div>
              {isOutOfStock ? (
                <Badge variant="danger" size="md">
                  Tạm hết hàng
                </Badge>
              ) : selectedVariant.availableQuantity <= 5 ? (
                <Badge variant="warning" size="md">
                  Chỉ còn {selectedVariant.availableQuantity} sản phẩm
                </Badge>
              ) : (
                <Badge variant="brand" size="md">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Sẵn có {selectedVariant.availableQuantity} sản phẩm
                </Badge>
              )}
            </div>
          </div>

          {/* Variant Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Tùy chọn cấu hình & Phiên bản:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {variants.map(v => {
                const isSelected = selectedVariant.variantId === v.variantId;
                return (
                  <div
                    key={v.variantId}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-2 ring-brand-500/10'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {v.variantName}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {formatCurrency(v.price)}
                      </span>
                      <span className="text-[11px] text-zinc-400">Còn {v.availableQuantity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Số lượng mua:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 p-1">
                <button
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= selectedVariant.availableQuantity || isOutOfStock}
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-zinc-400">
                (Tối đa {selectedVariant.availableQuantity} sản phẩm trong kho)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              leftIcon={<ShoppingCart className="w-5 h-5" />}
            >
              Thêm Vào Giỏ Hàng
            </Button>
            <Button
              variant="secondary"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="sm:w-44 font-bold"
            >
              Mua Ngay
            </Button>
          </div>

          {/* Value props mini */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <Truck className="w-4 h-4 text-brand-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold">Giao từ kho gần nhất</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold">Bảo hành 12 tháng</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <RotateCcw className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold">Đổi trả 7 ngày</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Specs */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-10 space-y-6">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'desc'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Mô Tả Sản Phẩm
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Thông Số Kỹ Thuật
          </button>
        </div>

        {activeTab === 'desc' && (
          <div className="max-w-3xl space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              {selectedVariant.description ||
                'Sản phẩm được gia công tỉ mỉ với tiêu chuẩn khắt khe, ứng dụng công nghệ hiện đại đem lại hiệu suất sử dụng vượt trội.'}
            </p>
            <p>
              Toàn bộ dữ liệu sản phẩm, biến thể và số lượng tồn kho được đồng bộ hoá thông qua hệ thống Cache Caffeine của Spring Boot kết hợp cơ chế kiểm tra tính hợp lệ dữ liệu chặt chẽ.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="max-w-2xl">
            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              <div className="py-3 grid grid-cols-3">
                <dt className="font-semibold text-zinc-400">Mã SKU</dt>
                <dd className="col-span-2 font-mono text-zinc-800 dark:text-zinc-200">{selectedVariant.sku}</dd>
              </div>
              <div className="py-3 grid grid-cols-3">
                <dt className="font-semibold text-zinc-400">Phiên bản</dt>
                <dd className="col-span-2 text-zinc-800 dark:text-zinc-200">{selectedVariant.variantName}</dd>
              </div>
              {selectedVariant.attributes &&
                Object.entries(selectedVariant.attributes).map(([k, v]) => (
                  <div key={k} className="py-3 grid grid-cols-3">
                    <dt className="font-semibold text-zinc-400">{k}</dt>
                    <dd className="col-span-2 text-zinc-800 dark:text-zinc-200">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
      </div>

      {/* Warehouse lookup modal */}
      <Modal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        title="Tồn Kho Đa Điểm (Multi-Warehouse Inventory)"
        description="Mạng lưới kho hàng phân tán phục vụ luồng điều phối giao nhận"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Thuật toán Haversine sẽ tính khoảng cách từ tọa độ của bạn tới từng kho để xuất hàng từ kho gần nhất có sẵn hàng.
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_WAREHOUSES.map((wh, idx) => (
              <div
                key={wh.id}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{wh.name}</h5>
                  <p className="text-[11px] text-zinc-400">{wh.addressLine}</p>
                </div>
                <div className="text-right">
                  <Badge variant={idx === 0 ? 'brand' : 'neutral'} size="sm">
                    {idx === 0 ? 'Kho chính: Còn hàng' : 'Dự phòng: Còn hàng'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
