import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { ecommerceService } from '../../services/ecommerceService';
import { CategoryResponse } from '../../types';
import { SearchSuggestions } from '../storefront/SearchSuggestions';

export const Navbar: React.FC = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { itemCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    ecommerceService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedQuery = searchQuery.trim();
    if (normalizedQuery) {
      setIsSearchFocused(false);
      navigate(`/catalog?q=${encodeURIComponent(normalizedQuery)}`);
    }
  };

  const handleViewAllSuggestions = (keyword: string) => {
    setSearchQuery(keyword);
    setIsSearchFocused(false);
    navigate(`/catalog?q=${encodeURIComponent(keyword)}`);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                  Ecom<span className="text-brand-600 dark:text-brand-400">Lab</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] font-semibold text-zinc-400 -mt-1 tracking-wider uppercase">
                Mua sắm công nghệ
              </p>
            </div>
          </Link>

          {/* Categories Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCategoryMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>Danh mục</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isCategoryMenuOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-2 z-50 animate-slide-down"
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
              >
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/catalog?category=${cat.id}`}
                    onClick={() => setIsCategoryMenuOpen(false)}
                    className="flex flex-col p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 line-clamp-1">{cat.description}</span>
                  </Link>
                ))}
                <div className="pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    to="/catalog"
                    onClick={() => setIsCategoryMenuOpen(false)}
                    className="block text-center text-xs font-semibold text-brand-600 dark:text-brand-400 py-1"
                  >
                    Xem tất cả sản phẩm →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
                placeholder="Tìm MacBook, iPhone, tai nghe Sony..."
                className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-transparent focus:border-brand-500 rounded-full pl-10 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand-500/20"
              />
              <SearchSuggestions
                keyword={searchQuery}
                isOpen={isSearchFocused}
                onSelectProduct={product => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                  navigate(`/products/${product.id}`);
                }}
                onViewAll={handleViewAllSuggestions}
                className="z-50"
              />
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Chuyển chế độ sáng/tối"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 p-2 px-3 rounded-xl bg-zinc-900 text-white hover:bg-brand-600 dark:bg-zinc-800 dark:hover:bg-brand-500 dark:hover:text-zinc-950 transition-all shadow-sm"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold">{itemCount}</span>
            </button>

            {/* User Account / Role Badge */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 font-bold text-xs">
                  {user ? user.displayName.charAt(0) : <User className="w-4 h-4" />}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                    {user ? user.displayName.split(' ')[0] : 'Đăng nhập'}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{role}</p>
                </div>
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-2 z-50 animate-slide-down"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {user?.displayName}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <span>Lịch sử đơn hàng</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <span>Hồ sơ & Sổ địa chỉ</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block w-full py-2 text-center text-xs font-bold bg-brand-600 text-white rounded-xl"
                      >
                        Đăng Nhập
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block w-full py-2 text-center text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                      >
                        Đăng Ký
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
