import { api } from './axiosInstance';

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface PaginatedOrders {
  content: OrderResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: string;
  billingAddress?: string;
  phoneNumber: string;
  paymentMethod: string;
  shippingCost: number;
  taxAmount: number;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName?: string;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  userId: number;
  status: 'AWAITING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'STOCK_RESERVED' | 'READY_FOR_SHIPMENT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PAYMENT_FAILED' | 'STOCK_RESERVATION_FAILED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingStatus: 'NOT_SHIPPED' | 'SHIPPED' | 'DELIVERED';
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalPrice: number;
  currency: string;
  shippingAddress: string;
  billingAddress: string;
  phoneNumber: string;
  paymentMethod: string;
  trackingNumber?: string;
  items: OrderItemResponse[]; // ARTIK ANY DEĞİL!
  createdAt: string;
  updatedAt: string;
}

export const createOrder = async (
  userId: number,
  orderData: CreateOrderRequest
): Promise<OrderResponse> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: OrderResponse;
  }>(`/v1/orders`, orderData);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Sipariş oluşturma başarısız');
  }

  return response.data.data;
};

export const getOrder = async (
  userId: number,
  orderId: number
): Promise<OrderResponse> => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: OrderResponse;
  }>(`/v1/orders/${orderId}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Sipariş getirilemedi');
  }

  return response.data.data;
};

export const getUserOrders = async (
  userId: number,
  page: number = 0,
  size: number = 10
): Promise<PaginatedOrders> => { // Burayı Promise<PaginatedOrders> yaptık
  const response = await api.get<{
    success: boolean;
    message: string;
    data: OrderResponse[];
    pagination: {
      totalElements: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  }>(`/v1/orders?page=${page}&size=${size}&sortBy=createdAt&sortDirection=desc`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Siparişler getirilemedi');
  }

  // Slice'ın beklediği objeyi tam olarak burada oluşturuyoruz
  return {
    content: response.data.data,
    totalElements: response.data.pagination.totalElements,
    totalPages: response.data.pagination.totalPages,
    currentPage: response.data.pagination.currentPage,
  };
};

export const getOrderByNumber = async (
  orderNumber: string
): Promise<OrderResponse> => {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: OrderResponse;
  }>(`/v1/orders/number/${orderNumber}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Sipariş getirilemedi');
  }

  return response.data.data;
};

export const updatePaymentStatus = async (
  orderId: number,
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
): Promise<OrderResponse> => {
  const response = await api.patch<{
    success: boolean;
    message: string;
    data: OrderResponse;
  }>(`/v1/orders/${orderId}/payment-status?paymentStatus=${paymentStatus}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Ödeme durumu güncellemesi başarısız');
  }

  return response.data.data;
};

export const shipOrder = async (
  orderId: number,
  trackingNumber: string
): Promise<OrderResponse> => {
  const response = await api.patch<{
    success: boolean;
    message: string;
    data: OrderResponse;
  }>(`/v1/orders/${orderId}/ship?trackingNumber=${trackingNumber}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Kargo işlemi başarısız');
  }

  return response.data.data;
};

export const deliverOrder = async (
  orderId: number
): Promise<OrderResponse> => {
  const response = await api.patch<{
    success: boolean;
    message: string;
    data: OrderResponse;
  }>(`/v1/orders/${orderId}/deliver`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Teslimat işlemi başarısız');
  }

  return response.data.data;
};

export const cancelOrder = async (
  orderId: number,
  reason: string
): Promise<OrderResponse> => {
  const response = await api.delete<{
    success: boolean;
    message: string;
    data: OrderResponse;
  }>(`/v1/orders/${orderId}/cancel?reason=${encodeURIComponent(reason)}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'İptal işlemi başarısız');
  }

  return response.data.data;
};