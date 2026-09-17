import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  Building,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  QrCode,
  Banknote,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockService } from '../../services/mockService';
import { formatCurrency, formatDistance } from '../../utils/format';
import { AddressResponse, ShipmentPlanResponse } from '../../types';
import { Button } from '../../components/ui/Button';

export const CheckoutPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'QR' | 'COD'>('QR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockStatus, setLockStatus] = useState<string>('');

  // Load addresses
  useEffect(() => {
    mockService.getAddresses().then(data => {
      setAddresses(data);
      const def = data.find(a => a.defaultAddress) || data[0];
      if (def) setSelectedAddressId(def.id);
    });
  }, []);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  // Simulated shipment plan preview based on selected address
  const [shipmentPlan, setShipmentPlan] = useState<ShipmentPlanResponse[]>([]);

  useEffect(() => {
    if (selectedAddress) {
      const isHanoi = selectedAddress.city.includes('Hà Nội');
      const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

      if (isHanoi) {
        setShipmentPlan([
          {
            warehouseId: 'wh-01',
            warehouseName: 'Tổng Kho Hà Nội (Long Biên)',
            quantity: totalQty,
            distanceKm: 8.4,
          },
        ]);
      } else {
        setShipmentPlan([
          {
            warehouseId: 'wh-02',
            warehouseName: 'Tổng Kho TP. Hồ Chí Minh (Tân Bình)',
            quantity: totalQty,
            distanceKm: 6.2,
          },
        ]);
      }
    }
  }, [selectedAddress, items]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      addToast('error', 'Chưa chọn địa chỉ', 'Vui lòng chọn địa chỉ nhận hàng.');
      return;
    }

    setIsSubmitting(true);
    setLockStatus('Đang thực hiện PESSIMISTIC_WRITE khóa tồn kho...');

    await new Promise(r => setTimeout(r, 600));
    setLockStatus('Đang tối ưu lộ trình điều phối kho (Haversine)...');

    await new Promise(r => setTimeout(r, 600));
    setLockStatus('Đang tạo bản ghi đơn hàng và phân luồng vận đơn...');

    try {
      const response = await mockService.checkout(selectedAddress.id, items);
      clearCart();
      addToast(
        'success',
        'Đặt hàng thành công!',
        `Mã đơn: ${response.orderNumber}. Kho đã tiếp nhận đóng gói.`
      );
      navigate(`/orders/${response.orderId}`);
    } catch (err: any) {
      addToast('error', 'Đặt hàng thất bại', err.message || 'Lỗi hệ thống');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-zinc-500">
          Hãy chọn ít nhất 1 sản phẩm trước khi tiến hành thanh toán.
        </p>
        <Button onClick={() => navigate('/catalog')}>Quay lại mua sắm</Button>
      </div>
    );
  }

  const steps = [
    { num: 1, title: 'Địa chỉ nhận hàng' },
    { num: 2, title: 'Điều phối đa kho' },
    { num: 3, title: 'Phương thức thanh toán' },
    { num: 4, title: 'Xác nhận đặt hàng' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Stepper Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map(s => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-brand-600 text-white'
                      : isCurrent
                      ? 'border-2 border-brand-500 text-brand-600 dark:text-brand-400 ring-4 ring-brand-500/10'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold text-center hidden sm:block ${
                    isCurrent || isCompleted
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Wizard Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Bước 1: Chọn Địa Chỉ Nhận Hàng
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Hệ thống sẽ dựa trên tọa độ GPS để tính toán kho hàng gần bạn nhất.
                  </p>
                </div>
                <MapPin className="w-5 h-5 text-brand-600" />
              </div>

              <div className="space-y-3">
                {addresses.map(addr => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {addr.recipientName}
                            </span>
                            <span className="text-xs text-zinc-500 font-mono">({addr.phone})</span>
                            {addr.defaultAddress && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                            {addr.addressLine}, {addr.city}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400 mt-1">
                            GPS Coordinates: [{addr.latitude}, {addr.longitude}]
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setCurrentStep(2)}
                >
                  Tiếp tục: Kế hoạch xuất kho
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Multi-Warehouse Routing */}
          {currentStep === 2 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Bước 2: Phân Bổ Kho Hàng (Haversine Routing)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Thuật toán tự động định tuyến xuất hàng từ kho tối ưu khoảng cách tới bạn.
                  </p>
                </div>
                <Building className="w-5 h-5 text-brand-600" />
              </div>

              <div className="space-y-4">
                {shipmentPlan.map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {plan.warehouseName}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          Khoảng cách đường chim bay:{' '}
                          <span className="font-bold text-brand-600 dark:text-brand-400">
                            {formatDistance(plan.distanceKm)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                        Xuất {plan.quantity} sản phẩm
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  variant="outline"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setCurrentStep(1)}
                >
                  Quay lại
                </Button>
                <Button
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setCurrentStep(3)}
                >
                  Tiếp tục: Thanh toán
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Bước 3: Chọn Phương Thức Thanh Toán
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Hỗ trợ quét mã QR tiện lợi, thẻ ngân hàng hoặc thanh toán khi nhận hàng.
                  </p>
                </div>
                <CreditCard className="w-5 h-5 text-brand-600" />
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('QR')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'QR'
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Chuyển Khoản Mã QR (VietQR / Napas247)
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Mã QR động tự điền số tiền và mã đơn hàng
                      </p>
                    </div>
                  </div>
                  {paymentMethod === 'QR' && <CheckCircle2 className="w-5 h-5 text-brand-500" />}
                </div>

                <div
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'CARD'
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Thẻ Quốc Tế (Visa / MasterCard / JCB)
                      </p>
                      <p className="text-[11px] text-zinc-500">Xác thực 3D Secure an toàn</p>
                    </div>
                  </div>
                  {paymentMethod === 'CARD' && <CheckCircle2 className="w-5 h-5 text-brand-500" />}
                </div>

                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Thanh Toán Khi Nhận Hàng (COD)
                      </p>
                      <p className="text-[11px] text-zinc-500">Kiểm tra hàng trước khi gửi tiền mặt</p>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && <CheckCircle2 className="w-5 h-5 text-brand-500" />}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  variant="outline"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setCurrentStep(2)}
                >
                  Quay lại
                </Button>
                <Button
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setCurrentStep(4)}
                >
                  Tiếp tục: Xem lại đơn
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Final Confirmation */}
          {currentStep === 4 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Bước 4: Xác Nhận & Đặt Hàng
                </h3>
                <p className="text-xs text-zinc-500">
                  Vui lòng kiểm tra lại thông tin nhận hàng và phương thức giao nhận.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2 text-xs">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Thông tin giao nhận:</p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Người nhận: <span className="font-semibold">{selectedAddress?.recipientName}</span> (
                    {selectedAddress?.phone})
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Địa chỉ: {selectedAddress?.addressLine}, {selectedAddress?.city}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Phương thức: {paymentMethod === 'QR' ? 'Chuyển khoản QR' : paymentMethod === 'CARD' ? 'Thẻ ngân hàng' : 'Tiền mặt COD'}
                  </p>
                </div>

                {isSubmitting && (
                  <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs flex items-center gap-3 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>{lockStatus}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  variant="outline"
                  disabled={isSubmitting}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setCurrentStep(3)}
                >
                  Quay lại
                </Button>
                <Button
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="font-bold px-8"
                >
                  Xác Nhận Đặt Hàng
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Cart Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Đơn hàng của bạn ({items.length} món)
            </h4>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-72 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-600">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Tạm tính</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Vận chuyển</span>
                <span className="text-emerald-600 font-semibold">Miễn phí</span>
              </div>
              <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span>Tổng cộng</span>
                <span className="text-base text-brand-600 dark:text-brand-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-[11px] text-zinc-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Khóa tồn kho chống oversell (Pessimistic Write Lock)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
