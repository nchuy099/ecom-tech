import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, User, Shield, Truck, Lock } from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState('customer@ecomlab.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, 'CUSTOMER');
      addToast('success', 'Đăng nhập thành công!', `Chào mừng ${email}`);
      navigate('/');
    } catch (err: any) {
      addToast('error', 'Đăng nhập thất bại', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleKey: 'CUSTOMER' | 'ADMIN' | 'SHIPPER') => {
    switchRole(roleKey);
    addToast('success', `Đăng nhập nhanh: ${roleKey}`, 'Tài khoản demo đã được kích hoạt');
    if (roleKey === 'ADMIN') navigate('/admin');
    else if (roleKey === 'SHIPPER') navigate('/shipper');
    else navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand logo & header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              Ecom<span className="text-brand-600 dark:text-brand-400">Lab</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Đăng Nhập Tài Khoản
          </h2>
          <p className="text-xs text-zinc-500">
            Tích hợp chuẩn Spring Security OAuth2 Resource Server & JWT Token
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              size="lg"
              type="submit"
              className="w-full font-bold"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Đăng Nhập
            </Button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">
              1-Click Đăng Nhập Nhanh (Demo Access)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('CUSTOMER')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-brand-500 transition-colors text-center text-xs font-semibold flex flex-col items-center gap-1"
              >
                <User className="w-4 h-4 text-blue-500" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-brand-500 transition-colors text-center text-xs font-semibold flex flex-col items-center gap-1"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('SHIPPER')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-brand-500 transition-colors text-center text-xs font-semibold flex flex-col items-center gap-1"
              >
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Shipper</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Tạo tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
};
