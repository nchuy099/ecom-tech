import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      {/* Value props banner */}
      <div className="border-b border-zinc-100 dark:border-zinc-800/80 py-8 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Giao Đa Kho Siêu Tốc</h4>
                <p className="text-[11px] text-zinc-500">Tự động chọn kho gần nhất</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Chính Hãng 100%</h4>
                <p className="text-[11px] text-zinc-500">Bảo hành 12 tháng chính quy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Đổi Trả Dễ Dàng</h4>
                <p className="text-[11px] text-zinc-500">Hoàn tiền hoặc đổi mới trong 7 ngày</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Hỗ Trợ 24/7</h4>
                <p className="text-[11px] text-zinc-500">Kỹ thuật viên tư vấn tận tâm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
                Ecom<span className="text-brand-600 dark:text-brand-400">Lab</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Dự án Frontend hiện đại kết nối với Spring Boot Monolith Java backend. Tích hợp tối ưu truy vấn JPA, OAuth2 JWT, thuật toán điều phối kho Haversine và luồng hoàn tất đơn hàng thời gian thực.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                Java 21 • Spring Boot 3.5
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                React 18 • Tailwind CSS
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">
              Khám Phá
            </h5>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li><Link to="/catalog" className="hover:text-brand-600 transition-colors">Tất cả sản phẩm</Link></li>
              <li><Link to="/catalog?category=cat-01" className="hover:text-brand-600 transition-colors">Laptop & Máy tính</Link></li>
              <li><Link to="/catalog?category=cat-02" className="hover:text-brand-600 transition-colors">Điện thoại Flagship</Link></li>
              <li><Link to="/catalog?category=cat-03" className="hover:text-brand-600 transition-colors">Thiết bị âm thanh</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">
              Quản Trị & Kho
            </h5>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li><Link to="/admin" className="hover:text-brand-600 transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/admin/products" className="hover:text-brand-600 transition-colors">Quản lý sản phẩm & SKU</Link></li>
              <li><Link to="/admin/warehouses" className="hover:text-brand-600 transition-colors">Mạng lưới kho hàng</Link></li>
              <li><Link to="/shipper" className="hover:text-brand-600 transition-colors">Cổng tài xế (Shipper)</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">
              API & Swagger
            </h5>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <a
                  href="http://localhost:8080/swagger-ui.html"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition-colors flex items-center gap-1"
                >
                  <span>Swagger UI (Springdoc)</span>
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8080/v3/api-docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  OpenAPI Spec JSON
                </a>
              </li>
              <li><Link to="/orders" className="hover:text-brand-600 transition-colors">Theo dõi đơn hàng</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400">
          <p>© 2026 EcomLab. Tất cả quyền được bảo lưu.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">Designed with high-density modern aesthetic</p>
        </div>
      </div>
    </footer>
  );
};
