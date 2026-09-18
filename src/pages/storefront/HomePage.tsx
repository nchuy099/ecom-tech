import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  Laptop,
  Smartphone,
  Headphones,
  Keyboard,
  Home,
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { ProductCard } from '../../components/storefront/ProductCard';
import { Button } from '../../components/ui/Button';
import { CategoryResponse, ProductSummaryResponse } from '../../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    ecommerceService.getCategories().then(setCategories);
    ecommerceService.getProducts({ size: 12 }).then(page => setProducts(page.items));
  }, []);

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-5 h-5" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      case 'Headphones': return <Headphones className="w-5 h-5" />;
      case 'Keyboard': return <Keyboard className="w-5 h-5" />;
      case 'Home': return <Home className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const flashSaleProducts = products.slice(0, 4);
  const featuredProducts = products.slice(2, 8);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background glow & mesh gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-500/20 via-emerald-400/15 to-purple-600/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50/80 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                Giao nhanh từ kho gần nhất
              </span>
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
              Trải Nghiệm Mua Sắm{' '}
              <span className="bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Công Nghệ Tối Thượng
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              Nền tảng thương mại điện tử với khả năng giữ hàng an toàn khi đặt đơn, chọn kho xuất phù hợp và theo dõi vận đơn theo thời gian thực.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => navigate('/catalog')}
              >
                Khám Phá Sản Phẩm
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Trải Nghiệm Đặt Hàng Nhanh
              </Button>
            </div>

            {/* Stats row */}
            <div className="pt-10 grid grid-cols-3 gap-4 border-t border-zinc-200/80 dark:border-zinc-800/80 max-w-xl mx-auto">
              <div>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">3+</p>
                <p className="text-xs text-zinc-500 mt-0.5">Tổng kho toàn quốc</p>
              </div>
              <div>
                <p className="text-2xl font-black text-brand-600 dark:text-brand-400">&lt; 0.05s</p>
                <p className="text-xs text-zinc-500 mt-0.5">Thời gian tra cứu kho</p>
              </div>
              <div>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">100%</p>
                <p className="text-xs text-zinc-500 mt-0.5">An toàn tồn kho</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Danh Mục Nổi Bật</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Chọn ngành hàng để khám phá sản phẩm chính hãng</p>
          </div>
          <button
            onClick={() => navigate('/catalog')}
            className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1"
          >
            <span>Tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate(`/catalog?category=${cat.id}`)}
              className="flex flex-col items-center p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-500/50 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-brand-500 group-hover:text-white transition-colors mb-3">
                {getCategoryIcon(cat.icon)}
              </div>
              <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner & Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-white border border-zinc-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Zap className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight">Flash Sale Trong Ngày</h2>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white uppercase">
                    Hot
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Số lượng có hạn, ưu đãi tự động kết thúc sau:</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2 font-mono text-sm font-bold">
              <div className="bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-700 text-center min-w-[44px]">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="block text-[9px] font-sans text-zinc-500 font-normal">Giờ</span>
              </div>
              <span className="text-zinc-500 font-bold">:</span>
              <div className="bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-700 text-center min-w-[44px]">
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="block text-[9px] font-sans text-zinc-500 font-normal">Phút</span>
              </div>
              <span className="text-zinc-500 font-bold">:</span>
              <div className="bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-700 text-center min-w-[44px]">
                <span className="text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="block text-[9px] font-sans text-zinc-500 font-normal">Giây</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flashSaleProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Sản Phẩm Đề Xuất
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Các thiết bị công nghệ hàng đầu được tinh chọn cho bạn</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/catalog')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Xem Tất Cả
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Fulfillment Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 lg:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Gợi ý kho giao phù hợp</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Tối Ưu Vận Chuyển Từ Mạng Lưới Kho Thông Minh
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Khi bạn đặt hàng, hệ thống tự động chọn kho phù hợp dựa trên địa chỉ nhận, số lượng còn hàng và khả năng giao nhanh. Đơn hàng có thể được gom hoặc chia kiện để rút ngắn thời gian giao nhận.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold">Kho Hà Nội (Long Biên)</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold">Kho TP.HCM (Tân Bình)</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-xs font-semibold">Kho Đà Nẵng (Hải Châu)</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400">Quy trình xử lý đơn</span>
                <span className="text-emerald-500 font-bold">Sẵn sàng</span>
              </div>
              <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <p className="text-zinc-800 dark:text-zinc-200 font-bold">
                  Minh họa luồng đặt hàng
                </p>
                <p className="text-zinc-500">1. Giữ hàng cho sản phẩm khách đã chọn</p>
                <p className="text-emerald-600 dark:text-emerald-400">
                  &gt; Số lượng được giữ an toàn trong thời gian xử lý
                </p>
                <p className="text-zinc-500">2. Chọn kho phù hợp với địa chỉ nhận</p>
                <p className="text-blue-600 dark:text-blue-400">
                  &gt; Kho Hà Nội đang có hàng và gần địa chỉ nhận
                </p>
                <p className="text-zinc-500">3. Tạo vận đơn và phân công tài xế</p>
                <p className="text-amber-600 dark:text-amber-400">
                  &gt; Vận đơn sẵn sàng giao cho khách
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
