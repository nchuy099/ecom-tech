// User and Auth Types
export type Role = 'CUSTOMER' | 'ADMIN' | 'WAREHOUSE_STAFF' | 'SHIPPER';

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface AddressResponse {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  latitude: number;
  longitude: number;
  defaultAddress: boolean;
}

export interface NotificationResponse {
  id: string;
  userId?: string;
  title: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  read: boolean;
  createdAt: string;
}

// Catalog and Product Types
export interface CategoryResponse {
  id: string;
  parentId?: string | null;
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
}

export interface ProductSummaryResponse {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  active: boolean;
  variantId: string;
  sku: string;
  variantName: string;
  price: number;
  availableQuantity: number;
  reservedQuantity: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
}

export interface ProductVariantDetailResponse {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  variantName: string;
  price: number;
  availableQuantity: number;
  reservedQuantity: number;
  imageUrl?: string;
  description?: string;
  attributes?: Record<string, string>;
}

export interface CursorPageResponse<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore: boolean;
}

// Cart Types
export interface CartItemResponse {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
  availableQuantity: number;
}

export interface CartResponse {
  id: string;
  items: CartItemResponse[];
  totalAmount: number;
  itemCount: number;
}

// Warehouse and Inventory Types
export interface WarehouseResponse {
  id: string;
  code: string;
  name: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface InventoryResponse {
  id: string;
  warehouseId: string;
  warehouseName: string;
  variantId: string;
  sku: string;
  productName: string;
  availableQuantity: number;
  reservedQuantity: number;
}

// Order, Shipment, and Checkout Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemResponse {
  id: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  city: string;
  recipientName?: string;
  phone?: string;
  addressLine?: string;
  items: OrderItemResponse[];
  createdAt: string;
}

export interface ShipmentPlanResponse {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  distanceKm: number;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  shipments: ShipmentPlanResponse[];
}

export type ShipmentStatus =
  | 'PENDING_PACKING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'CANCELLED';

export interface TrackingEvent {
  status: ShipmentStatus;
  timestamp: string;
  location: string;
  note: string;
}

export interface ShipmentResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  warehouseId: string;
  warehouseName: string;
  shipperId?: string;
  shipperName?: string;
  status: ShipmentStatus;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  distanceKm: number;
  updatedAt: string;
  timeline?: TrackingEvent[];
}

export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'REFUNDED';

export interface ReturnResponse {
  id: string;
  orderId: string;
  status: ReturnStatus;
  reason: string;
  createdAt?: string;
}
