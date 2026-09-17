import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_PRODUCT_DETAILS,
  MOCK_WAREHOUSES,
  MOCK_ORDERS,
  MOCK_SHIPMENTS,
  MOCK_ADDRESSES,
  MOCK_NOTIFICATIONS,
  MOCK_INVENTORY,
} from './mockData';
import {
  CategoryResponse,
  ProductSummaryResponse,
  ProductVariantDetailResponse,
  CursorPageResponse,
  OrderResponse,
  CheckoutResponse,
  ShipmentResponse,
  AddressResponse,
  NotificationResponse,
  InventoryResponse,
  WarehouseResponse,
  CartItemResponse,
  ShipmentStatus,
} from '../types';

// In-memory state for UI interactions
let products = [...MOCK_PRODUCTS];
let orders = [...MOCK_ORDERS];
let shipments = [...MOCK_SHIPMENTS];
let addresses = [...MOCK_ADDRESSES];
let notifications = [...MOCK_NOTIFICATIONS];
let inventory = [...MOCK_INVENTORY];

// Haversine formula to compute distance in KM (mimics com.ecomlab.ecommerce.common.util.Haversine)
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const mockService = {
  // Categories
  getCategories: async (): Promise<CategoryResponse[]> => {
    return [...MOCK_CATEGORIES];
  },

  // Products
  getProducts: async (params?: {
    keyword?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    cursor?: string;
    size?: number;
  }): Promise<CursorPageResponse<ProductSummaryResponse>> => {
    let filtered = [...products];

    if (params?.keyword) {
      const q = params.keyword.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }

    if (params?.categoryId) {
      filtered = filtered.filter(p => p.categoryId === params.categoryId);
    }

    if (params?.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= params.maxPrice!);
    }

    const size = params?.size || 10;
    return {
      items: filtered.slice(0, size),
      hasMore: filtered.length > size,
      nextCursor: filtered.length > size ? 'next-cursor-token' : null,
    };
  },

  getProductDetail: async (productId: string): Promise<ProductVariantDetailResponse[]> => {
    if (MOCK_PRODUCT_DETAILS[productId]) {
      return MOCK_PRODUCT_DETAILS[productId];
    }
    const prod = products.find(p => p.id === productId);
    if (!prod) return [];
    return [
      {
        productId: prod.id,
        productName: prod.name,
        variantId: prod.variantId,
        sku: prod.sku,
        variantName: prod.variantName,
        price: prod.price,
        availableQuantity: prod.availableQuantity,
        reservedQuantity: prod.reservedQuantity,
        imageUrl: prod.imageUrl,
        description: 'Sản phẩm chính hãng với tiêu chuẩn chất lượng cao nhất, bảo hành 12 tháng 1 đổi 1.',
      },
    ];
  },

  // Warehouses & Inventory
  getWarehouses: async (): Promise<WarehouseResponse[]> => {
    return [...MOCK_WAREHOUSES];
  },

  getInventory: async (): Promise<InventoryResponse[]> => {
    return [...inventory];
  },

  adjustInventory: async (warehouseId: string, variantId: string, delta: number): Promise<void> => {
    const item = inventory.find(
      i => i.warehouseId === warehouseId && i.variantId === variantId
    );
    if (item) {
      item.availableQuantity = Math.max(0, item.availableQuantity + delta);
    }
  },

  // Addresses
  getAddresses: async (): Promise<AddressResponse[]> => {
    return [...addresses];
  },

  addAddress: async (data: Omit<AddressResponse, 'id'>): Promise<AddressResponse> => {
    const newAddr: AddressResponse = {
      ...data,
      id: `addr-${Date.now()}`,
    };
    if (newAddr.defaultAddress) {
      addresses = addresses.map(a => ({ ...a, defaultAddress: false }));
    }
    addresses.push(newAddr);
    return newAddr;
  },

  setDefaultAddress: async (id: string): Promise<void> => {
    addresses = addresses.map(a => ({
      ...a,
      defaultAddress: a.id === id,
    }));
  },

  // Checkout with multi-warehouse fulfillment simulation
  checkout: async (
    addressId: string,
    cartItems: CartItemResponse[]
  ): Promise<CheckoutResponse> => {
    // Find target address
    const targetAddress = addresses.find(a => a.id === addressId) || addresses[0];
    const targetLat = targetAddress ? targetAddress.latitude : 21.0173;
    const targetLon = targetAddress ? targetAddress.longitude : 105.7838;

    // Multi-warehouse routing simulation: Sort warehouses by distance
    const sortedWarehouses = [...MOCK_WAREHOUSES]
      .map(wh => ({
        ...wh,
        distanceKm: calculateHaversineKm(targetLat, targetLon, wh.latitude, wh.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Formulate shipment plan
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const primaryWh = sortedWarehouses[0];
    const secondaryWh = sortedWarehouses[1] || sortedWarehouses[0];

    // Split shipment plan if multiple items
    const shipmentPlan = [];
    if (totalQuantity > 1 && sortedWarehouses.length > 1) {
      const q1 = Math.ceil(totalQuantity / 2);
      const q2 = totalQuantity - q1;
      shipmentPlan.push({
        warehouseId: primaryWh.id,
        warehouseName: primaryWh.name,
        quantity: q1,
        distanceKm: primaryWh.distanceKm,
      });
      shipmentPlan.push({
        warehouseId: secondaryWh.id,
        warehouseName: secondaryWh.name,
        quantity: q2,
        distanceKm: secondaryWh.distanceKm,
      });
    } else {
      shipmentPlan.push({
        warehouseId: primaryWh.id,
        warehouseName: primaryWh.name,
        quantity: totalQuantity,
        distanceKm: primaryWh.distanceKm,
      });
    }

    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}`;
    const totalAmount = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);

    // Save order
    const newOrder: OrderResponse = {
      id: orderId,
      orderNumber,
      status: 'CONFIRMED',
      totalAmount,
      city: targetAddress?.city || 'Hà Nội',
      recipientName: targetAddress?.recipientName || 'Khách hàng',
      phone: targetAddress?.phone || '0988 123 456',
      addressLine: targetAddress?.addressLine || '',
      createdAt: new Date().toISOString(),
      items: cartItems.map(c => ({
        id: `item-${Date.now()}-${c.id}`,
        variantId: c.variantId,
        productName: c.productName,
        variantName: c.variantName,
        sku: c.sku,
        price: c.price,
        quantity: c.quantity,
        subtotal: c.lineTotal,
        imageUrl: c.imageUrl,
      })),
    };

    orders.unshift(newOrder);

    // Create tracking shipment
    const newShipment: ShipmentResponse = {
      id: `shp-${Date.now()}`,
      orderId,
      orderNumber,
      warehouseId: primaryWh.id,
      warehouseName: primaryWh.name,
      status: 'PENDING_PACKING',
      trackingNumber: `VNPOST-${primaryWh.code}-${Math.floor(100000 + Math.random() * 900000)}`,
      recipientName: targetAddress?.recipientName || 'Khách hàng',
      recipientPhone: targetAddress?.phone || '0988 123 456',
      deliveryAddress: `${targetAddress?.addressLine}, ${targetAddress?.city}`,
      distanceKm: primaryWh.distanceKm,
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'PENDING_PACKING',
          timestamp: new Date().toISOString(),
          location: primaryWh.name,
          note: 'Đơn hàng mới tạo. Hệ thống khóa hàng tạm giữ thành công (Pessimistic Reservation).',
        },
      ],
    };
    shipments.unshift(newShipment);

    // Create notification
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Đặt hàng thành công #${orderNumber}`,
      message: `Đơn hàng đã được xác nhận và điều phối xuất kho từ ${primaryWh.name} (cách ${primaryWh.distanceKm} km).`,
      status: 'SENT',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return {
      orderId,
      orderNumber,
      totalAmount,
      shipments: shipmentPlan,
    };
  },

  // Orders
  getOrders: async (): Promise<OrderResponse[]> => {
    return [...orders];
  },

  getOrderDetail: async (orderId: string): Promise<OrderResponse | undefined> => {
    return orders.find(o => o.id === orderId);
  },

  cancelOrder: async (orderId: string): Promise<OrderResponse | null> => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.status === 'PENDING') {
      order.status = 'CANCELLED';
      return { ...order };
    }
    return null;
  },

  // Shipments
  getShipments: async (): Promise<ShipmentResponse[]> => {
    return [...shipments];
  },

  getShipmentByOrder: async (orderId: string): Promise<ShipmentResponse | undefined> => {
    return shipments.find(s => s.orderId === orderId);
  },

  updateShipmentStatus: async (
    shipmentId: string,
    newStatus: ShipmentStatus,
    note?: string
  ): Promise<void> => {
    const shipment = shipments.find(s => s.id === shipmentId);
    if (shipment) {
      shipment.status = newStatus;
      shipment.updatedAt = new Date().toISOString();
      if (!shipment.timeline) shipment.timeline = [];
      shipment.timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        location: shipment.warehouseName,
        note: note || `Cập nhật trạng thái: ${newStatus}`,
      });

      // Synchronize order status
      const order = orders.find(o => o.id === shipment.orderId);
      if (order) {
        if (newStatus === 'DELIVERED') order.status = 'DELIVERED';
        else if (newStatus === 'OUT_FOR_DELIVERY' || newStatus === 'IN_TRANSIT')
          order.status = 'SHIPPED';
      }
    }
  },

  // Notifications
  getNotifications: async (): Promise<NotificationResponse[]> => {
    return [...notifications];
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    const n = notifications.find(notif => notif.id === id);
    if (n) n.read = true;
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    notifications = notifications.map(n => ({ ...n, read: true }));
  },
};
