import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  LogOut,
  MapPin,
  Navigation,
  Package,
  Phone,
  QrCode,
  RefreshCcw,
  Route,
  Search,
  Truck,
  Upload,
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { ShipmentResponse, ShipmentStatus } from '../../types';
import { formatDistance } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { decodeQrFile } from '../../utils/qr';

const ACTIVE_ROUTE_STATUSES = new Set<ShipmentStatus>([
  'PENDING_PACKING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
]);

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING_PACKING: 'Chờ lấy hàng',
  READY_FOR_PICKUP: 'Sẵn sàng lấy',
  PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT: 'Đang di chuyển',
  OUT_FOR_DELIVERY: 'Đang giao',
  DELIVERED: 'Đã giao',
  DELIVERY_FAILED: 'Giao thất bại',
  CANCELLED: 'Đã hủy',
};

const statusVariant = (status: ShipmentStatus) => {
  if (status === 'DELIVERED') return 'brand';
  if (status === 'OUT_FOR_DELIVERY' || status === 'IN_TRANSIT') return 'info';
  if (status === 'DELIVERY_FAILED' || status === 'CANCELLED') return 'danger';
  return 'warning';
};

const canStartDelivery = (shipment: ShipmentResponse) =>
  shipment.status === 'PENDING_PACKING' || shipment.status === 'READY_FOR_PICKUP';

const canCompleteDelivery = (shipment: ShipmentResponse) =>
  shipment.status === 'OUT_FOR_DELIVERY';

const coordinateDistance = (
  fromLatitude?: number,
  fromLongitude?: number,
  toLatitude?: number,
  toLongitude?: number
) => {
  if (
    fromLatitude === undefined ||
    fromLongitude === undefined ||
    toLatitude === undefined ||
    toLongitude === undefined
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const radiusKm = 6371;
  const latitudeDelta = ((toLatitude - fromLatitude) * Math.PI) / 180;
  const longitudeDelta = ((toLongitude - fromLongitude) * Math.PI) / 180;
  const firstLatitude = (fromLatitude * Math.PI) / 180;
  const secondLatitude = (toLatitude * Math.PI) / 180;
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const routeShipments = (shipments: ShipmentResponse[]) => {
  const pending = shipments.filter(shipment => ACTIVE_ROUTE_STATUSES.has(shipment.status));
  const completed = shipments.filter(shipment => !ACTIVE_ROUTE_STATUSES.has(shipment.status));

  if (pending.length <= 1) {
    return [...pending, ...completed];
  }

  const remaining = [...pending];
  const first = remaining.reduce((nearest, shipment) =>
    shipment.distanceKm < nearest.distanceKm ? shipment : nearest
  );
  const result = [first];
  let currentLatitude = first.deliveryLatitude ?? first.warehouseLatitude;
  let currentLongitude = first.deliveryLongitude ?? first.warehouseLongitude;
  remaining.splice(remaining.indexOf(first), 1);

  while (remaining.length > 0) {
    const next = remaining.reduce((nearest, shipment) => {
      const currentDistance = coordinateDistance(
        currentLatitude,
        currentLongitude,
        shipment.deliveryLatitude,
        shipment.deliveryLongitude
      );
      const nearestDistance = coordinateDistance(
        currentLatitude,
        currentLongitude,
        nearest.deliveryLatitude,
        nearest.deliveryLongitude
      );

      return currentDistance < nearestDistance ? shipment : nearest;
    });

    result.push(next);
    currentLatitude = next.deliveryLatitude;
    currentLongitude = next.deliveryLongitude;
    remaining.splice(remaining.indexOf(next), 1);
  }

  return [...result, ...completed];
};

const extractTrackingNumber = (rawValue: string) => {
  const value = rawValue.trim();

  if (!value) {
    return '';
  }

  try {
    const url = new URL(value);
    const queryValue =
      url.searchParams.get('trackingNumber') ||
      url.searchParams.get('tracking') ||
      url.searchParams.get('code');

    if (queryValue) {
      return queryValue.trim();
    }

    const segments = url.pathname.split('/').filter(Boolean);
    return (segments[segments.length - 1] || value).trim();
  } catch {
    return value;
  }
};

const shipmentMapUrl = (shipment: ShipmentResponse) =>
  `https://maps.google.com/?q=${encodeURIComponent(shipment.deliveryAddress)}`;

export const ShipperDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentResponse | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrUploadLoading, setQrUploadLoading] = useState(false);
  const [qrUploadFileName, setQrUploadFileName] = useState('');
  const [qrUploadError, setQrUploadError] = useState('');
  const { addToast } = useToast();
  const { user, logout } = useAuth();

  const refreshShipments = useCallback(async () => {
    setLoading(true);

    try {
      const data = await ecommerceService.getTodayShipments();
      setShipments(data);
    } catch (err: any) {
      addToast('error', 'Không tải được danh sách giao hàng', err.message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshShipments();
  }, [refreshShipments]);

  const routeItems = useMemo(() => routeShipments(shipments), [shipments]);

  const activeCount = useMemo(
    () => shipments.filter(shipment => ACTIVE_ROUTE_STATUSES.has(shipment.status)).length,
    [shipments]
  );

  const deliveredCount = useMemo(
    () => shipments.filter(shipment => shipment.status === 'DELIVERED').length,
    [shipments]
  );

  const failedCount = useMemo(
    () => shipments.filter(shipment => shipment.status === 'DELIVERY_FAILED').length,
    [shipments]
  );

  const efficiencyStats = useMemo(() => {
    const completedAttempts = deliveredCount + failedCount;
    const efficiencyPercent = completedAttempts === 0
      ? 0
      : Math.round((deliveredCount / completedAttempts) * 100);

    return {
      completedAttempts,
      efficiencyPercent,
    };
  }, [deliveredCount, failedCount]);

  const replaceShipment = (nextShipment: ShipmentResponse) => {
    setShipments(prev => {
      const exists = prev.some(shipment => shipment.id === nextShipment.id);

      if (!exists) {
        return [nextShipment, ...prev];
      }

      return prev.map(shipment =>
        shipment.id === nextShipment.id ? nextShipment : shipment
      );
    });
  };

  const handleLookup = async (value = trackingNumber) => {
    const normalizedTrackingNumber = extractTrackingNumber(value);

    if (!normalizedTrackingNumber) {
      addToast('error', 'Thiếu mã vận đơn', 'Nhập hoặc quét mã vận đơn trước.');
      return;
    }

    setLookupLoading(true);

    try {
      const shipment =
        await ecommerceService.lookupShipmentByTrackingNumber(normalizedTrackingNumber);
      replaceShipment(shipment);
      setSelectedShipment(shipment);
      setTrackingNumber(shipment.trackingNumber);
      setScannerOpen(false);
    } catch (err: any) {
      addToast('error', 'Không tìm thấy vận đơn', err.message || 'Vận đơn không thuộc tài xế này');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleUpdateStatus = async (
    shipment: ShipmentResponse,
    newStatus: ShipmentStatus,
    label: string
  ) => {
    try {
      await ecommerceService.updateShipmentStatus(shipment.id, newStatus, label);
      const updatedShipment = { ...shipment, status: newStatus };
      replaceShipment(updatedShipment);
      setSelectedShipment(prev =>
        prev?.id === shipment.id ? updatedShipment : prev
      );
      addToast('success', 'Đã cập nhật vận đơn', label);
    } catch (err: any) {
      addToast('error', 'Không thể cập nhật vận đơn', err.message || 'Lỗi hệ thống');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleUploadQr = async (file?: File) => {
    if (!file) {
      return;
    }

    setQrUploadLoading(true);
    setQrUploadFileName(file.name);
    setQrUploadError('');

    try {
      const decodedValue = await decodeQrFile(file);

      if (!decodedValue) {
        setQrUploadError('Không đọc được QR trong ảnh này. Thử ảnh rõ hơn hoặc nhập mã thủ công.');
        return;
      }

      setTrackingNumber(extractTrackingNumber(decodedValue));
      await handleLookup(decodedValue);
    } catch {
      setQrUploadError('Không xử lý được ảnh QR. Vui lòng chọn lại ảnh khác.');
    } finally {
      setQrUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 pb-20 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-emerald-500/20 bg-emerald-700 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <h1 className="text-base font-extrabold leading-none">Cổng Tài Xế</h1>
            </div>
            <p className="mt-1 text-xs text-emerald-100">
              {user?.displayName || 'Shipper'} • Lộ trình giao hàng hôm nay
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-950/40 px-3 py-1.5 text-xs font-bold">
              {activeCount} đơn cần giao
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-950/70"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">Mở nhanh vận đơn</h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Quét QR hoặc nhập mã vận đơn để mở đúng đơn cần xác nhận.
                </p>
              </div>
              <QrCode className="h-6 w-6 text-emerald-500" />
            </div>

            <div className="space-y-3">
              <Input
                value={trackingNumber}
                onChange={event => setTrackingNumber(event.target.value)}
                placeholder="VD: VNPOST-WH-HN-01-..."
                leftIcon={<Search className="h-4 w-4" />}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    handleLookup();
                  }
                }}
              />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setScannerOpen(true)}
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  Tải QR lên
                </Button>
                <Button
                  type="button"
                  onClick={() => handleLookup()}
                  isLoading={lookupLoading}
                  leftIcon={<Package className="h-4 w-4" />}
                >
                  Mở đơn
                </Button>
              </div>
            </div>
          </div>

          <EfficiencyCard
            percent={efficiencyStats.efficiencyPercent}
            deliveredCount={deliveredCount}
            failedCount={failedCount}
            completedAttempts={efficiencyStats.completedAttempts}
          />

          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Cần giao" value={activeCount} tone="emerald" />
            <SummaryCard label="Hoàn tất" value={deliveredCount} tone="zinc" />
            <SummaryCard label="Tổng đơn" value={shipments.length} tone="blue" />
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide">
                  Gợi ý lộ trình
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Ưu tiên các điểm giao gần nhau để đi trong ngày.
                </p>
              </div>
              <Route className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-extrabold">Danh sách đơn cần giao hôm nay</h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Mở từng đơn để gọi khách, dẫn đường và xác nhận giao hàng.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={refreshShipments}
              isLoading={loading}
              leftIcon={<RefreshCcw className="h-4 w-4" />}
            >
              Tải lại
            </Button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <div className="p-8 text-center text-sm text-zinc-500">Đang tải đơn giao...</div>
            ) : routeItems.length === 0 ? (
              <div className="p-8 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="mt-3 text-sm font-bold">Chưa có đơn cần giao hôm nay</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Khi kho bàn giao kiện hàng, đơn sẽ xuất hiện ở đây.
                </p>
              </div>
            ) : (
              routeItems.map((shipment, index) => (
                <ShipmentRow
                  key={shipment.id}
                  index={index + 1}
                  shipment={shipment}
                  onOpen={() => setSelectedShipment(shipment)}
                  onStart={() =>
                    handleUpdateStatus(shipment, 'OUT_FOR_DELIVERY', 'Đang giao hàng')
                  }
                  onComplete={() =>
                    handleUpdateStatus(shipment, 'DELIVERED', 'Giao thành công')
                  }
                />
              ))
            )}
          </div>
        </section>
      </main>

      <Modal
        isOpen={Boolean(selectedShipment)}
        onClose={() => setSelectedShipment(null)}
        title="Chi tiết vận đơn"
        description="Kiểm tra thông tin người nhận trước khi xác nhận."
        maxWidth="lg"
      >
        {selectedShipment && (
          <ShipmentDetail
            shipment={selectedShipment}
            onStart={() =>
              handleUpdateStatus(selectedShipment, 'OUT_FOR_DELIVERY', 'Đang giao hàng')
            }
            onComplete={() =>
              handleUpdateStatus(selectedShipment, 'DELIVERED', 'Giao thành công')
            }
          />
        )}
      </Modal>

      <Modal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Tải ảnh QR vận đơn"
        description="Chọn ảnh QR khách hàng cung cấp để mở nhanh vận đơn."
        maxWidth="md"
      >
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/60 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20">
            <Upload className="h-8 w-8 text-emerald-500" />
            <span className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Chọn ảnh QR từ máy
            </span>
            <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Hỗ trợ ảnh PNG, JPG, JPEG, WEBP.
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={event => handleUploadQr(event.target.files?.[0])}
            />
          </label>

          {qrUploadFileName && (
            <div className="rounded-2xl bg-zinc-50 p-3 text-xs font-medium text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
              Ảnh đã chọn: {qrUploadFileName}
            </div>
          )}

          {qrUploadError && (
            <div className="flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{qrUploadError}</span>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-2xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>Nếu ảnh QR mờ hoặc không đọc được, nhập mã vận đơn thủ công bên dưới.</span>
          </div>

          <Input
            value={trackingNumber}
            onChange={event => setTrackingNumber(event.target.value)}
            placeholder="Nhập mã vận đơn nếu không đọc được QR"
          />
          <Button
            type="button"
            className="w-full"
            onClick={() => handleLookup()}
            isLoading={lookupLoading || qrUploadLoading}
          >
            Mở vận đơn
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: number; tone: 'emerald' | 'zinc' | 'blue' }> = ({
  label,
  value,
  tone,
}) => {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    zinc: 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200',
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',
  };

  return (
    <div className={cn('rounded-2xl p-4 text-center shadow-sm', tones[tone])}>
      <div className="text-2xl font-black">{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-wide">{label}</div>
    </div>
  );
};

const EfficiencyCard: React.FC<{
  percent: number;
  deliveredCount: number;
  failedCount: number;
  completedAttempts: number;
}> = ({ percent, deliveredCount, failedCount, completedAttempts }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_130px]">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-5 text-white shadow-lg shadow-violet-900/20">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-100">
            Hiệu suất hôm nay
          </p>
          <TrendingUp className="h-5 w-5 text-violet-100" />
        </div>

        <div className="mt-4 text-5xl font-black leading-none tracking-tight">
          {percent}%
        </div>

        <p className="mt-4 text-sm font-medium text-violet-50">
          {completedAttempts > 0
            ? `${completedAttempts} đơn đã xử lý trong hôm nay`
            : 'Chưa có đơn nào hoàn tất trong hôm nay'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
        <div className="rounded-3xl bg-emerald-50 p-4 text-center shadow-sm dark:bg-emerald-950/30">
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
            {deliveredCount}
          </div>
          <div className="mt-1 text-[11px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Thành công
          </div>
        </div>

        <div className="rounded-3xl bg-rose-50 p-4 text-center shadow-sm dark:bg-rose-950/30">
          <div className="text-3xl font-black text-rose-700 dark:text-rose-300">
            {failedCount}
          </div>
          <div className="mt-1 text-[11px] font-black uppercase tracking-wide text-rose-700 dark:text-rose-300">
            Thất bại
          </div>
        </div>
      </div>
    </div>
  );
};

const ShipmentRow: React.FC<{
  index: number;
  shipment: ShipmentResponse;
  onOpen: () => void;
  onStart: () => void;
  onComplete: () => void;
}> = ({ index, shipment, onOpen, onStart, onComplete }) => {
  const delivered = shipment.status === 'DELIVERED';

  return (
    <div
      className={cn(
        'grid gap-4 p-5 transition-colors lg:grid-cols-[44px_minmax(0,1fr)_auto]',
        delivered ? 'bg-zinc-50/60 opacity-75 dark:bg-zinc-900/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        {index}
      </div>

      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-black text-zinc-900 dark:text-zinc-100">
            {shipment.trackingNumber}
          </span>
          <Badge variant={statusVariant(shipment.status)} size="sm">
            {STATUS_LABELS[shipment.status]}
          </Badge>
        </div>

        <div className="mt-3 grid gap-3 text-xs text-zinc-500 md:grid-cols-2 dark:text-zinc-400">
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {shipment.recipientName}
            </p>
            <p className="mt-1 line-clamp-2">{shipment.deliveryAddress}</p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
            <p>Kho xuất: {shipment.warehouseName}</p>
            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
              {formatDistance(shipment.distanceKm)}
            </p>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
        <a
          href={shipmentMapUrl(shipment)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-emerald-300 dark:hover:bg-zinc-700"
        >
          <Navigation className="h-4 w-4" />
          Dẫn đường
        </a>

        {canStartDelivery(shipment) && (
          <Button type="button" size="sm" onClick={onStart}>
            Bắt đầu giao
          </Button>
        )}

        {canCompleteDelivery(shipment) && (
          <Button
            type="button"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={onComplete}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            Giao xong
          </Button>
        )}
      </div>
    </div>
  );
};

const ShipmentDetail: React.FC<{
  shipment: ShipmentResponse;
  onStart: () => void;
  onComplete: () => void;
}> = ({ shipment, onStart, onComplete }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-sm font-black">{shipment.trackingNumber}</span>
          <Badge variant={statusVariant(shipment.status)} size="sm">
            {STATUS_LABELS[shipment.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Người nhận</p>
          <p className="mt-2 font-black">{shipment.recipientName}</p>
          <a
            href={`tel:${shipment.recipientPhone}`}
            className="mt-2 inline-flex items-center gap-1.5 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400"
          >
            <Phone className="h-4 w-4" />
            {shipment.recipientPhone}
          </a>
        </div>

        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Kho xuất</p>
          <p className="mt-2 font-black">{shipment.warehouseName}</p>
          <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatDistance(shipment.distanceKm)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
        <p className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          <span>{shipment.deliveryAddress}</span>
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <a
          href={shipmentMapUrl(shipment)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-emerald-300 dark:hover:bg-zinc-700"
        >
          <Navigation className="h-4 w-4" />
          Dẫn đường
        </a>

        <Button type="button" disabled={!canStartDelivery(shipment)} onClick={onStart}>
          Bắt đầu giao
        </Button>

        <Button
          type="button"
          disabled={!canCompleteDelivery(shipment)}
          className="bg-emerald-600 hover:bg-emerald-500"
          onClick={onComplete}
          leftIcon={<CheckCircle2 className="h-4 w-4" />}
        >
          Giao thành công
        </Button>
      </div>
    </div>
  );
};
