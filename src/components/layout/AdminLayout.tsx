import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ArrowLeft,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Tổng Quan (Dashboard)', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Sản Phẩm & SKU', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Kho Hàng & Tồn Kho', path: '/admin/warehouses', icon: <Warehouse className="w-4 h-4" /> },
    { label: 'Điều Phối Giao Hàng', path: '/admin/shipments', icon: <Truck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
        {/* Admin Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white">
                Admin Console
              </span>
              <p className="text-[10px] text-zinc-400 font-mono">Ecom Monolith Java</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1 flex-1">
          <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Quản Trị Hệ Thống
          </p>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Return to Storefront */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Cửa Hàng (Storefront)</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Topbar */}
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Hệ thống</span>
            <span>/</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {navItems.find(n => n.path === location.pathname)?.label || 'Quản trị'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/notifications"
              className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-none">{user?.displayName || 'Admin'}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">ROLE_ADMIN</p>
              </div>
            </div>
          </div>
        </header>

        {/* View content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
