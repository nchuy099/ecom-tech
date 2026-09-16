import React, { useEffect, useState } from 'react';
import { Check, PackageCheck, RotateCcw, Truck, X } from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { ReturnResponse, ShipmentResponse, UserProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';

const statusLabel: Record<ReturnResponse['status'], string> = {
  REQUESTED: 'Chờ duyệt', APPROVED: 'Chờ lấy hàng', REJECTED: 'Từ chối', RECEIVED: 'Đã về kho', RESTOCKED: 'Đã kiểm hàng', REFUNDED: 'Đã hoàn tiền',
};

export const AdminReturnsPage: React.FC = () => {
  const { role } = useAuth();
  const { addToast } = useToast();
  const [returns, setReturns] = useState<ReturnResponse[]>([]);
  const [shippers, setShippers] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<ReturnResponse | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'refund' | null>(null);
  const [note, setNote] = useState('');
  const [receiving, setReceiving] = useState<ShipmentResponse | null>(null);
  const [receipt, setReceipt] = useState<Record<string, { received: number; restocked: number }>>({});

  const refresh = () => ecommerceService.getAdminReturns().then(setReturns).catch(error => addToast('error', 'Không tải được trả hàng', error.message));
  useEffect(() => {
    refresh();
    if (role === 'ADMIN') ecommerceService.getShippers().then(setShippers);
  }, [role]);

  const replace = (updated: ReturnResponse) => setReturns(current => current.map(value => value.id === updated.id ? updated : value));
  const submitDecision = async () => {
    if (!selected || !action) return;
    try {
      const updated = action === 'approve'
        ? await ecommerceService.approveReturn(selected.id, note || undefined)
        : action === 'reject'
          ? await ecommerceService.rejectReturn(selected.id, note)
          : await ecommerceService.refundReturn(selected.id);
      replace(updated);
      setAction(null); setNote('');
      addToast('success', action === 'refund' ? 'Đã xác nhận hoàn tiền' : 'Đã cập nhật yêu cầu trả hàng');
    } catch (error: any) { addToast('error', 'Không thể cập nhật', error.message); }
  };

  const assign = async (shipmentId: string, shipperId: string) => {
    try {
      await ecommerceService.assignReturnShipment(shipmentId, shipperId);
      refresh();
      addToast('success', 'Đã gán shipper lấy hàng trả');
    } catch (error: any) { addToast('error', 'Không thể gán shipper', error.message); }
  };

  const openReceipt = (shipment: ShipmentResponse) => {
    setReceiving(shipment);
    setReceipt(Object.fromEntries((shipment.items || []).map(item => [item.id, { received: item.quantity, restocked: item.quantity }])));
  };
  const submitReceipt = async () => {
    if (!receiving) return;
    try {
      const updated = await ecommerceService.receiveReturnShipment(receiving.id, Object.entries(receipt).map(([shipmentItemId, value]) => ({ shipmentItemId, receivedQuantity: value.received, restockedQuantity: value.restocked })));
      replace(updated); setReceiving(null);
      addToast('success', 'Đã kiểm nhận và cập nhật tồn kho');
    } catch (error: any) { addToast('error', 'Không thể kiểm nhận', error.message); }
  };

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Trả Hàng & Hoàn Tiền</h1><p className="mt-1 text-xs text-zinc-500">Duyệt yêu cầu, điều phối lấy hàng, kiểm kho và xác nhận hoàn tiền.</p></div>
    <div className="space-y-3">
      {returns.length === 0 ? <div className="border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">Chưa có yêu cầu trả hàng.</div> : returns.map(value => <article key={value.id} className="border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-xs font-bold">Đơn #{value.orderId.slice(0, 8)}</p><p className="mt-1 break-words text-xs text-zinc-500">{value.reason}</p></div><Badge variant={value.status === 'REJECTED' ? 'danger' : value.status === 'REFUNDED' ? 'brand' : 'warning'} size="sm">{statusLabel[value.status]}</Badge></div>
        <div className="mt-4 divide-y divide-zinc-100 border-y border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">{value.items.map(item => <div key={item.id} className="flex flex-wrap justify-between gap-2 py-2 text-xs"><span className="font-medium">{item.name} <span className="font-mono text-zinc-400">{item.sku}</span></span><span className="text-zinc-500">Yêu cầu {item.requestedQuantity} · Nhận {item.receivedQuantity} · Nhập kho {item.restockedQuantity}</span></div>)}</div>
        {value.decisionNote && <p className="mt-3 text-xs text-zinc-500">Ghi chú: {value.decisionNote}</p>}
        {value.shipments.length > 0 && <div className="mt-4 space-y-2">{value.shipments.map(shipment => <div key={shipment.id} className="flex flex-col gap-3 border border-zinc-200 p-3 text-xs dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-mono font-bold">{shipment.trackingNumber}</p><p className="mt-0.5 text-zinc-500">{shipment.warehouseName} · {shipment.status}</p></div>{role === 'ADMIN' && shipment.status === 'PENDING_PACKING' && <select className="min-h-11 rounded-lg border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900" defaultValue="" onChange={event => event.target.value && assign(shipment.id, event.target.value)}><option value="">Gán shipper</option>{shippers.map(shipper => <option key={shipper.id} value={shipper.id}>{shipper.displayName}</option>)}</select>}{shipment.status === 'DELIVERED' && !shipment.warehouseReceivedAt && <Button size="sm" className="w-full sm:w-auto" leftIcon={<PackageCheck className="h-3.5 w-3.5" />} onClick={() => openReceipt(shipment)}>Kiểm nhận kho</Button>}</div>)}</div>}
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">{role === 'ADMIN' && value.status === 'REQUESTED' && <><Button className="w-full sm:w-auto" variant="outline" size="sm" leftIcon={<X className="h-3.5 w-3.5" />} onClick={() => { setSelected(value); setAction('reject'); setNote(''); }}>Từ chối</Button><Button className="w-full sm:w-auto" size="sm" leftIcon={<Check className="h-3.5 w-3.5" />} onClick={() => { setSelected(value); setAction('approve'); setNote(''); }}>Duyệt yêu cầu</Button></>}{role === 'ADMIN' && value.status === 'RESTOCKED' && <Button className="w-full sm:w-auto" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => { setSelected(value); setAction('refund'); setNote(''); }}>Hoàn {formatCurrency(value.refundableAmount || 0)}</Button>}</div>
      </article>)}</div>

    <Modal isOpen={action !== null} onClose={() => setAction(null)} title={action === 'approve' ? 'Duyệt yêu cầu trả hàng' : action === 'reject' ? 'Từ chối yêu cầu trả hàng' : 'Xác nhận hoàn tiền'} description={action === 'refund' ? 'Hệ thống sẽ tự tạo mã tham chiếu hoàn tiền.' : 'Ghi chú sẽ hiển thị cho khách hàng.'}>
      <div className="space-y-4">{action !== 'refund' && <textarea className="min-h-24 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-base dark:border-zinc-700 dark:bg-zinc-800" value={note} onChange={event => setNote(event.target.value)} placeholder="Ghi chú xử lý" />}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" variant="outline" onClick={() => setAction(null)}>Hủy</Button><Button className="w-full sm:w-auto" disabled={action === 'reject' && !note.trim()} onClick={submitDecision}>Xác nhận</Button></div></div>
    </Modal>
    <Modal isOpen={receiving !== null} onClose={() => setReceiving(null)} title="Kiểm nhận hàng trả" description="Chỉ số lượng nhập kho mới được cộng vào tồn khả dụng."><div className="space-y-3">{(receiving?.items || []).map(item => <div key={item.id} className="border-b border-zinc-100 pb-3 dark:border-zinc-800"><p className="text-xs font-bold">{item.name} <span className="font-mono text-zinc-400">{item.sku}</span></p><div className="mt-2 grid grid-cols-2 gap-3"><label className="text-xs text-zinc-500">Nhận thực tế<input type="number" min="0" max={item.quantity} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900" value={receipt[item.id]?.received ?? 0} onChange={event => setReceipt(current => ({ ...current, [item.id]: { ...current[item.id], received: Number(event.target.value) } }))} /></label><label className="text-xs text-zinc-500">Nhập lại kho<input type="number" min="0" max={receipt[item.id]?.received ?? 0} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900" value={receipt[item.id]?.restocked ?? 0} onChange={event => setReceipt(current => ({ ...current, [item.id]: { ...current[item.id], restocked: Number(event.target.value) } }))} /></label></div></div>)}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" variant="outline" onClick={() => setReceiving(null)}>Hủy</Button><Button className="w-full sm:w-auto" onClick={submitReceipt}>Xác nhận kiểm nhận</Button></div></div></Modal>
  </div>;
};
