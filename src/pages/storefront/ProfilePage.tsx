import React, { useState, useEffect } from 'react';
import { User, MapPin, Plus, Trash2, CheckCircle2, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockService } from '../../services/mockService';
import { AddressResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New address form state
  const [recipientName, setRecipientName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('0988 123 456');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [latitude, setLatitude] = useState(21.0285);
  const [longitude, setLongitude] = useState(105.8542);
  const [defaultAddress, setDefaultAddress] = useState(false);

  useEffect(() => {
    mockService.getAddresses().then(setAddresses);
  }, []);

  const handleSetDefault = async (id: string) => {
    await mockService.setDefaultAddress(id);
    setAddresses(prev =>
      prev.map(a => ({
        ...a,
        defaultAddress: a.id === id,
      }))
    );
    addToast('success', 'Đã đổi địa chỉ mặc định');
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim()) {
      addToast('error', 'Thiếu địa chỉ', 'Vui lòng nhập số nhà / tên đường.');
      return;
    }

    const created = await mockService.addAddress({
      recipientName,
      phone,
      addressLine,
      city,
      latitude,
      longitude,
      defaultAddress,
    });

    setAddresses(prev => {
      if (defaultAddress) {
        return [...prev.map(a => ({ ...a, defaultAddress: false })), created];
      }
      return [...prev, created];
    });

    setIsAddModalOpen(false);
    addToast('success', 'Thêm địa chỉ mới thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Tài Khoản & Sổ Địa Chỉ
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Quản lý thông tin cá nhân và tọa độ GPS phục vụ điều phối kho hàng.
        </p>
      </div>

      {/* User profile card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-xl">
            {user?.displayName.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {user?.displayName || 'Người Dùng'}
            </h3>
            <p className="text-xs text-zinc-500">{user?.email || 'user@ecomlab.com'}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                ROLE_{role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Sổ Địa Chỉ Giao Hàng
            </h3>
            <p className="text-xs text-zinc-500">Tọa độ GPS chuẩn để thuật toán Haversine tính toán khoảng cách</p>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Thêm Địa Chỉ
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                addr.defaultAddress
                  ? 'border-brand-500 bg-brand-50/10 dark:bg-brand-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {addr.recipientName}
                  </span>
                  {addr.defaultAddress ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      Mặc định
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] text-zinc-400 hover:text-brand-600"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>

                <p className="text-xs text-zinc-500 font-mono">{addr.phone}</p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  {addr.addressLine}, {addr.city}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 pt-1">
                  GPS: [{addr.latitude}, {addr.longitude}]
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Địa Chỉ Giao Hàng Mới"
        description="Nhập thông tin nhận hàng và tọa độ GPS định tuyến kho"
      >
        <form onSubmit={handleCreateAddress} className="space-y-4">
          <Input
            label="Tên người nhận"
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            required
          />
          <Input
            label="Số điện thoại"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <Input
            label="Địa chỉ chi tiết"
            value={addressLine}
            onChange={e => setAddressLine(e.target.value)}
            placeholder="Số nhà, ngõ, tên đường..."
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                Tỉnh / Thành
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>
            <Input
              label="Vĩ độ (Lat)"
              type="number"
              step="any"
              value={latitude}
              onChange={e => setLatitude(Number(e.target.value))}
            />
            <Input
              label="Kinh độ (Lon)"
              type="number"
              step="any"
              value={longitude}
              onChange={e => setLongitude(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={defaultAddress}
              onChange={e => setDefaultAddress(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-600"
            />
            <label htmlFor="isDefault" className="text-xs text-zinc-700 dark:text-zinc-300">
              Đặt làm địa chỉ nhận hàng mặc định
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button size="sm" type="submit">
              Lưu Địa Chỉ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
