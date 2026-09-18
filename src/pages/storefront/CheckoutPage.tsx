import React, { useMemo, useState, useEffect } from 'react';
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
  AlertCircle,
  X,
  Search,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ecommerceService } from '../../services/ecommerceService';
import { ApiError } from '../../services/api';
import { formatCurrency, formatDistance } from '../../utils/format';
import {
  AddressResponse,
  CheckoutItemAvailabilityResponse,
  InventoryResponse,
  ShipmentPlanResponse,
} from '../../types';
import { Button } from '../../components/ui/Button';

const INSUFFICIENT_INVENTORY_TEXT =
  'Một số sản phẩm không đủ hàng tại khu vực giao đã chọn. Vui lòng chọn địa chỉ khác.';

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
    ecommerceService.getAddresses().then(data => {
      setAddresses(data);
      const def = data.find(a => a.defaultAddress) || data[0];
      if (def) setSelectedAddressId(def.id);
    });
  }, []);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const [shipmentPlan, setShipmentPlan] = useState<ShipmentPlanResponse[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItemAvailabilityResponse[]>([]);
  const [shipmentPlanErrorCode, setShipmentPlanErrorCode] = useState<string>('');
  const [isLoadingShipmentPlan, setIsLoadingShipmentPlan] = useState(false);
  const [lookupItem, setLookupItem] = useState<CheckoutItemAvailabilityResponse | null>(null);
  const [lookupInventory, setLookupInventory] = useState<InventoryResponse[]>([]);
  const [isLoadingLookupInventory, setIsLoadingLookupInventory] = useState(false);

  useEffect(() => {
    if (!selectedAddress || items.length === 0) {
      setShipmentPlan([]);
      setCheckoutItems([]);
      setShipmentPlanErrorCode('');
      setIsLoadingShipmentPlan(false);
      return;
    }

    setIsLoadingShipmentPlan(true);
    setShipmentPlanErrorCode('');

    ecommerceService
      .checkoutPreview(selectedAddress.id)
      .then(response => {
        setShipmentPlan(response.shipments || []);
        setCheckoutItems(response.items || []);
      })
      .catch((error: Error) => {
        setShipmentPlan([]);
        setCheckoutItems([]);
        setShipmentPlanErrorCode(
          error instanceof ApiError
            ? error.error || 'CHECKOUT_PREVIEW_FAILED'
            : 'CHECKOUT_PREVIEW_FAILED'
        );
      })
      .finally(() => setIsLoadingShipmentPlan(false));
  }, [selectedAddress, items]);

  const availabilityByVariantId = useMemo(() => {
    return new Map(checkoutItems.map(item => [item.variantId, item]));
  }, [checkoutItems]);

  const hasUnavailableItems = checkoutItems.some(item => !item.available);

  const canContinueToPayment =
    !isLoadingShipmentPlan &&
    !shipmentPlanErrorCode &&
    !hasUnavailableItems &&
    shipmentPlan.length > 0;

  const shipmentPlanErrorText =
    shipmentPlanErrorCode === 'INSUFFICIENT_INVENTORY'
      ? INSUFFICIENT_INVENTORY_TEXT
      : 'Không thể kiểm tra tồn kho cho địa chỉ này. Vui lòng thử lại.';

  const handleOpenInventoryLookup = async (availability: CheckoutItemAvailabilityResponse) => {
    if (!selectedAddress) return;

    setLookupItem(availability);
    setLookupInventory([]);
    setIsLoadingLookupInventory(true);

    try {
      const response = await ecommerceService.getVariantWarehouseInventory(
        availability.variantId,
        selectedAddress.id
      );
      setLookupInventory(response);
    } catch (error: any) {
      addToast('error', 'Không thể tra cứu kho', error.message || 'Vui lòng thử lại sau.');
    } finally {
      setIsLoadingLookupInventory(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      addToast('error', 'Chưa chọn địa chỉ', 'Vui lòng chọn địa chỉ nhận hàng.');
      return;
    }

    if (!canContinueToPayment) {
      addToast(
        'error',
        'Không thể đặt hàng',
        shipmentPlanErrorCode
          ? shipmentPlanErrorText
          : 'Chưa có kế hoạch xuất kho hợp lệ cho địa chỉ đã chọn.'
      );
      return;
    }

    setIsSubmitting(true);
    setLockStatus('Đang giữ hàng cho đơn của bạn...');

    await new Promise(r => setTimeout(r, 600));
    setLockStatus('Đang chọn kho giao phù hợp...');

    await new Promise(r => setTimeout(r, 600));
    setLockStatus('Đang tạo bản ghi đơn hàng và phân luồng vận đơn...');

    try {
      const response = await ecommerceService.checkout(selectedAddress.id, items);
      await clearCart();
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
    { num: 2, title: 'Kế hoạch xuất kho' },
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
                    Hệ thống sẽ kiểm tra tồn kho tại khu vực giao của địa chỉ đã chọn.
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
                            Dùng làm địa chỉ nhận hàng và gợi ý kho giao phù hợp
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {isLoadingShipmentPlan && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      Đang kiểm tra tồn kho tại khu vực giao...
                    </span>
                  </div>
                )}

                {!isLoadingShipmentPlan && (shipmentPlanErrorCode || hasUnavailableItems) && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/70 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                        Khu vực này không đủ hàng
                      </p>
                      <p className="text-[11px] text-rose-600 dark:text-rose-300/90">
                        {shipmentPlanErrorCode ? shipmentPlanErrorText : INSUFFICIENT_INVENTORY_TEXT}
                      </p>
                    </div>
                  </div>
                )}

                {!isLoadingShipmentPlan &&
                  !shipmentPlanErrorCode &&
                  !hasUnavailableItems &&
                  shipmentPlan.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        Khu vực này đủ hàng
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-300/90">
                        Có thể tiếp tục để xem kế hoạch xuất kho chi tiết.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setCurrentStep(2)}
                  disabled={!canContinueToPayment}
                >
                  Tiếp tục: Kế hoạch xuất kho
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Warehouse plan */}
          {currentStep === 2 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Bước 2: Kế Hoạch Xuất Kho
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Đơn chỉ được xuất từ kho phục vụ cùng khu vực với địa chỉ nhận hàng.
                  </p>
                </div>
                <Building className="w-5 h-5 text-brand-600" />
              </div>

              <div className="space-y-4">
                {isLoadingShipmentPlan && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      Đang kiểm tra tồn kho theo khu vực giao...
                    </span>
                  </div>
                )}

                {!isLoadingShipmentPlan && (shipmentPlanErrorCode || hasUnavailableItems) && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/70 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                        Không thể giao cho khu vực đã chọn
                      </p>
                      <p className="text-[11px] text-rose-600 dark:text-rose-300/90">
                        {shipmentPlanErrorCode ? shipmentPlanErrorText : INSUFFICIENT_INVENTORY_TEXT}
                      </p>
                    </div>
                  </div>
                )}

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
                          Kho cùng khu vực giao, khoảng cách:{' '}
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
                  disabled={!canContinueToPayment}
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
                  disabled={!canContinueToPayment}
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

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-72 overflow-y-auto overflow-x-hidden pr-1">
              {items.map(item => {
                const availability = availabilityByVariantId.get(item.variantId);
                const isUnavailable = availability && !availability.available;

                return (
                  <div key={item.id} className="py-3 space-y-2">
                    <div className="flex items-start gap-3 min-w-0">
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
                        <p className="mt-1 text-xs font-bold text-brand-600">
                          {formatCurrency(item.lineTotal)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-[60px] flex flex-wrap items-center gap-2">
                      <div className="shrink-0">
                        {isLoadingShipmentPlan && (
                          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                            Đang kiểm tra
                          </span>
                        )}

                        {!isLoadingShipmentPlan && availability && !isUnavailable && (
                          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Đủ hàng
                          </span>
                        )}

                        {!isLoadingShipmentPlan && isUnavailable && (
                          <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                            Thiếu hàng
                          </span>
                        )}
                      </div>

                      {availability && (
                        <button
                          type="button"
                          onClick={() => handleOpenInventoryLookup(availability)}
                          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Search className="w-3 h-3" />
                          Tra cứu kho
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
              <span>Giữ hàng an toàn để tránh bán vượt số lượng</span>
            </div>
          </div>
        </div>
      </div>

      {lookupItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Tra cứu tồn kho
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {lookupItem.productName} · {lookupItem.sku}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLookupItem(null)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
              {isLoadingLookupInventory && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    Đang lấy tồn kho...
                  </span>
                </div>
              )}

              {!isLoadingLookupInventory && lookupInventory.length === 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-500">
                  Chưa có kho nào còn dữ liệu tồn cho sản phẩm này.
                </div>
              )}

              {!isLoadingLookupInventory &&
                lookupInventory.map(inventory => (
                  <div
                    key={inventory.id}
                    className={`p-4 rounded-2xl border ${
                      inventory.deliverableToSelectedAddress
                        ? 'border-brand-500/70 bg-brand-50/30 dark:bg-brand-950/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {inventory.warehouseName}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {inventory.warehousePriorityArea || 'Khu vực kho'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          inventory.deliverableToSelectedAddress
                            ? 'bg-brand-600 text-white'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {inventory.deliverableToSelectedAddress ? 'Cùng khu vực' : 'Khác khu vực'}
                      </span>
                    </div>

                    <div className="mt-3 text-[11px]">
                      <div className="rounded-xl bg-white/70 dark:bg-zinc-900/60 p-3">
                        <p className="text-zinc-500">Tồn khả dụng</p>
                        <p className="text-sm font-black text-brand-600">
                          {inventory.availableQuantity} sp
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
