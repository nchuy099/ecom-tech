import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Warehouse, Truck, RotateCcw, ShieldCheck, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const roleLabel = role === 'WAREHOUSE_STAFF' ? 'Nhân viên kho' : role === 'ADMIN' ? 'Quản trị viên' : 'Nhân sự vận hành';
  const navItems = [
    { label: 'Tổng Quan (Dashboard)', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Sản Phẩm & SKU', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Kho Hàng & Tồn Kho', path: '/admin/warehouses', icon: <Warehouse className="w-4 h-4" /> },
    { label: 'Điều Phối Giao Hàng', path: '/admin/shipments', icon: <Truck className="w-4 h-4" /> },
    { label: 'Trả Hàng & Hoàn Tiền', path: '/admin/returns', icon: <RotateCcw className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsNavigationOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navigation = (isDrawer = false) => (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      <div className="flex min-h-16 items-center justify-between border-b border-zinc-100 px-5 dark:border-zinc-800 lg:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500"><ShieldCheck className="w-5 h-5" /></div>
          <div className="min-w-0"><span className="block truncate text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white">Bảng Quản Trị</span><p className="text-[10px] font-mono text-zinc-400">EcomLab vận hành</p></div>
        </div>
        {isDrawer && <button type="button" onClick={() => setIsNavigationOpen(false)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden" aria-label="Đóng menu quản trị"><X className="h-5 w-5" /></button>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Điều hướng quản trị">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quản Trị Hệ Thống</p>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} onClick={() => setIsNavigationOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${isActive ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'}`}>{item.icon}<span>{item.label}</span></Link>;
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 lg:flex lg:flex-col">{navigation()}</aside>
      {isNavigationOpen && <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu quản trị">
        <button type="button" className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm" onClick={() => setIsNavigationOpen(false)} aria-label="Đóng menu quản trị" />
        <aside className="relative h-[100dvh] w-[min(20rem,85vw)] overflow-y-auto bg-white pt-[env(safe-area-inset-top)] shadow-2xl dark:bg-zinc-900">{navigation(true)}</aside>
      </div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-zinc-200 bg-white/90 px-4 py-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
            <button type="button" onClick={() => setIsNavigationOpen(true)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden" aria-label="Mở menu quản trị" aria-expanded={isNavigationOpen}><Menu className="h-5 w-5" /></button>
            <span className="hidden sm:inline">Hệ thống</span><span className="hidden sm:inline">/</span><span className="truncate font-bold text-zinc-900 dark:text-zinc-100">{navItems.find(n => n.path === location.pathname)?.label || 'Quản trị'}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button type="button" onClick={toggleTheme} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" aria-label="Chuyển chế độ sáng tối">{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <div className="hidden items-center gap-2.5 border-l border-zinc-200 pl-3 dark:border-zinc-800 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400">AD</div><div className="hidden text-left md:block"><p className="text-xs font-bold leading-none">{user?.displayName || 'Admin'}</p><p className="mt-0.5 text-[10px] font-mono text-zinc-400">{roleLabel}</p></div></div>
            <button type="button" onClick={handleLogout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Đăng xuất</span></button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-clip p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
