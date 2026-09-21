import { api } from './api';
import {
  AddressResponse,
  CartResponse,
  CategoryResponse,
  CheckoutResponse,
  CursorPageResponse,
  InventoryResponse,
  NotificationResponse,
  OrderResponse,
  ProductSummaryResponse,
  ProductVariantDetailResponse,
  ReturnResponse,
  ShipmentResponse,
  ShipmentStatus,
  ShippingZoneResponse,
  UserProfile,
  WarehouseResponse,
} from '../types';

function query(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  const text = search.toString();
  return text ? `?${text}` : '';
}

export const ecommerceService = {
  getCategories: () => api.get<CategoryResponse[]>('/categories'),

  getProducts: (params?: {
    keyword?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sort?: string;
    cursor?: string;
    size?: number;
  }) => api.get<CursorPageResponse<ProductSummaryResponse>>(`/products${query(params || {})}`),

  getProductDetail: (productId: string) =>
    api.get<ProductVariantDetailResponse[]>(`/products/${productId}`),

  getProductInventory: (productId: string) =>
    api.get<InventoryResponse[]>(`/products/${productId}/inventory`),

  getVariantWarehouseInventory: (variantId: string, addressId: string) =>
    api.get<InventoryResponse[]>(
      `/inventory/variants/${variantId}/warehouses${query({ addressId })}`
    ),

  createProduct: (data: { categoryId: string; name: string; description?: string }) =>
    api.post<{ id: string; categoryId: string; name: string; description?: string; active: boolean }>(
      '/admin/products',
      data
    ),

  createVariant: (
    productId: string,
    data: { sku: string; name: string; price: number; imageUrl?: string }
  ) =>
    api.post<{ id: string; productId: string; sku: string; name: string; price: number; imageUrl?: string; active: boolean }>(
      `/admin/products/${productId}/variants`,
      data
    ),

  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<{ imageUrl: string; objectKey: string; contentType: string; size: number }>(
      '/admin/media/images',
      formData
    );
  },

  importProductImage: (url: string) =>
    api.post<{ imageUrl: string; objectKey: string; contentType: string; size: number }>(
      '/admin/media/images/import',
      { url }
    ),

  deleteProduct: (productId: string) => api.delete<void>(`/admin/products/${productId}`),

  getWarehouses: () => api.get<WarehouseResponse[]>('/admin/warehouses'),

  getShippingZones: () => api.get<ShippingZoneResponse[]>('/admin/shipping-zones'),

  getInventory: (params?: { warehouseId?: string; variantId?: string }) =>
    api.get<InventoryResponse[]>(`/admin/inventory${query(params || {})}`),

  adjustInventory: (warehouseId: string, variantId: string, quantityDelta: number) =>
    api.post<InventoryResponse>('/admin/inventory/adjust', {
      warehouseId,
      variantId,
      quantityDelta,
    }),

  upsertInventory: (warehouseId: string, variantId: string, availableQuantity: number) =>
    api.put<InventoryResponse>('/admin/inventory', {
      warehouseId,
      variantId,
      availableQuantity,
    }),

  getCart: () => api.get<CartResponse>('/cart'),

  addCartItem: (variantId: string, quantity: number) =>
    api.post<CartResponse>('/cart/items', { variantId, quantity }),

  updateCartItem: (itemId: string, quantity: number) =>
    api.patch<CartResponse>(`/cart/items/${itemId}?quantity=${quantity}`),

  removeCartItem: (itemId: string) => api.delete<void>(`/cart/items/${itemId}`),

  clearCart: () => api.delete<void>('/cart'),

  getAddresses: () => api.get<AddressResponse[]>('/users/me/addresses'),

  addAddress: (data: Omit<AddressResponse, 'id'>) =>
    api.post<AddressResponse>('/users/me/addresses', data),

  setDefaultAddress: (id: string) => api.patch<void>(`/users/me/addresses/${id}/default`),

  checkoutPreview: (addressId: string) =>
    api.post<CheckoutResponse>('/checkout/preview', { addressId }),

  checkout: (addressId: string, _cartItems?: unknown) =>
    api.post<CheckoutResponse>('/checkout', { addressId }),

  getOrders: async (params?: { status?: string; cursor?: string; size?: number }) => {
    const page = await api.get<CursorPageResponse<OrderResponse>>(
      `/orders${query({ size: 50, ...(params || {}) })}`
    );
    return page.items;
  },

  getAdminOrders: async (params?: { status?: string; cursor?: string; size?: number }) => {
    const page = await api.get<CursorPageResponse<OrderResponse>>(
      `/admin/orders${query({ size: 50, ...(params || {}) })}`
    );
    return page.items;
  },

  getOrderDetail: (orderId: string) => api.get<OrderResponse>(`/orders/${orderId}`),

  cancelOrder: (orderId: string) => api.post<OrderResponse>(`/orders/${orderId}/cancel`),

  getReturns: () => api.get<ReturnResponse[]>('/returns'),

  createReturn: (orderId: string, reason: string, items: Array<{ orderItemId: string; quantity: number }>) =>
    api.post<ReturnResponse>('/returns', {
      orderId,
      reason,
      items,
    }),

  getAdminReturns: () => api.get<ReturnResponse[]>('/admin/returns'),
  approveReturn: (returnId: string, note?: string) => api.post<ReturnResponse>(`/admin/returns/${returnId}/approve`, { note }),
  rejectReturn: (returnId: string, note: string) => api.post<ReturnResponse>(`/admin/returns/${returnId}/reject`, { note }),
  assignReturnShipment: (shipmentId: string, shipperId: string) => api.post<ShipmentResponse>(`/admin/returns/shipments/${shipmentId}/assign`, { shipperId }),
  receiveReturnShipment: (shipmentId: string, items: Array<{ shipmentItemId: string; receivedQuantity: number; restockedQuantity: number }>) =>
    api.post<ReturnResponse>(`/admin/returns/shipments/${shipmentId}/receive`, { items }),
  refundReturn: (returnId: string) => api.post<ReturnResponse>(`/admin/returns/${returnId}/refund`),

  getShipmentByOrder: async (orderId: string) => {
    const shipments = await api.get<ShipmentResponse[]>(`/orders/${orderId}/shipments`);
    return shipments[0];
  },

  getShipments: () => api.get<ShipmentResponse[]>('/admin/shipments'),

  getAssignedShipments: () => api.get<ShipmentResponse[]>('/shipper/shipments'),

  getTodayShipments: () => api.get<ShipmentResponse[]>('/shipper/shipments/today'),

  lookupShipmentByTrackingNumber: (trackingNumber: string) =>
    api.get<ShipmentResponse>(`/shipper/shipments/lookup${query({ trackingNumber })}`),

  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus, note?: string) =>
    api.post<void>(`/shipper/shipments/${shipmentId}/tracking`, { status, note }),

  getShippers: () => api.get<UserProfile[]>('/admin/shipments/shippers'),

  assignShipper: (shipmentId: string, shipperId: string) =>
    api.post<ShipmentResponse>(`/admin/shipments/${shipmentId}/assign`, { shipperId }),

  getNotifications: () => api.get<NotificationResponse[]>('/notifications'),

  markNotificationAsRead: (id: string) => api.post<NotificationResponse>(`/notifications/${id}/read`),

  markAllNotificationsAsRead: () => api.post<void>('/notifications/read-all'),
};
