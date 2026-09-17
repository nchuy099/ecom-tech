import React, { useState } from 'react';
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  User,
  Shield,
  Truck,
  Building,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { useToast } from '../../context/ToastContext';

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole, mockMode, setMockMode, token } = useAuth();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const roles: { key: Role | 'GUEST'; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'CUSTOMER', label: 'Khách hàng', icon: <User className="w-3.5 h-3.5" />, color: 'text-blue-500' },
    { key: 'ADMIN', label: 'Quản trị viên', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-amber-500' },
    { key: 'SHIPPER', label: 'Tài xế giao hàng', icon: <Truck className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
    { key: 'WAREHOUSE_STAFF', label: 'Thủ kho', icon: <Building className="w-3.5 h-3.5" />, color: 'text-purple-500' },
    { key: 'GUEST', label: 'Khách vãng lai', icon: <User className="w-3.5 h-3.5 opacity-50" />, color: 'text-zinc-400' },
  ];

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      addToast('info', 'Đã sao chép Bearer Token', 'Dùng token này để test Swagger / Postman');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
        {/* Header Bar */}
        <div
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 select-none"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Dev Tool</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
            <span>{role}</span>
          </div>

          <div className="text-zinc-400 ml-1">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {/* Expandable Body */}
        {isOpen && (
          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 w-64 animate-slide-up">
            {/* Mock Mode Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <div>
                  <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Mock Data UI</p>
                  <p className="text-[9px] text-zinc-400">
                    {mockMode ? 'Chế độ Demo đầy đủ' : 'Kết nối Spring Boot :8080'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMockMode(!mockMode)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  mockMode ? 'bg-brand-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    mockMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Role Switch Buttons */}
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Chuyển nhanh vai trò
              </p>
              <div className="grid grid-cols-1 gap-1">
                {roles.map(r => {
                  const isActive = role === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => {
                        switchRole(r.key);
                        addToast('info', 'Đã chuyển vai trò', `Đang xem dưới vai trò ${r.label}`);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isActive ? 'text-white dark:text-zinc-900' : r.color}>
                          {r.icon}
                        </span>
                        <span>{r.label}</span>
                      </div>
                      {isActive && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* JWT copy */}
            {token && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={handleCopyToken}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép token' : 'Copy JWT Bearer Token'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
