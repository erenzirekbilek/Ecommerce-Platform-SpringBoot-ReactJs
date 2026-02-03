import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';import * as orderApi from '../../services/Orderapi'; 
import type { RootState } from '../../app/store';
import axios from 'axios';

// --- Tipler ---
export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName?: string;
}

export interface CreateOrderRequest {
  items: { productId: number; quantity: number; unitPrice: number }[];
  shippingAddress: string;
  billingAddress?: string;
  phoneNumber: string;
  paymentMethod: string;
  shippingCost: number;
  taxAmount: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalPrice: number;
  currency: string;
  shippingAddress: string;
  billingAddress: string;
  phoneNumber: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  currentOrder: Order | null;
  userOrders: Order[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalElements: number;
}

const initialState: OrderState = {
  currentOrder: null,
  userOrders: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  totalElements: 0,
};

// Yardımcı Hata Yakalayıcı (any uyarısını bitirir)
const getErrorMessage = (err: unknown, defaultMsg: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || defaultMsg;
  }
  return err instanceof Error ? err.message : defaultMsg;
};

// --- Thunk Tanımları ---

export const createOrder = createAsyncThunk<orderApi.OrderResponse, { userId: number; orderData: orderApi.CreateOrderRequest }>(
  'order/createOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return await orderApi.createOrder(payload.userId, payload.orderData);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Sipariş oluşturulamadı'));
    }
  }
);

export const getUserOrders = createAsyncThunk<orderApi.PaginatedOrders, { userId: number; page?: number; size?: number }>(
  'order/getUserOrders',
  async (payload, { rejectWithValue }) => {
    try {
      return await orderApi.getUserOrders(payload.userId, payload.page, payload.size);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Siparişler getirilemedi'));
    }
  }
);

export const getOrder = createAsyncThunk<orderApi.OrderResponse, { userId: number; orderId: number }>(
  'order/getOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return await orderApi.getOrder(payload.userId, payload.orderId);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Sipariş detayları alınamadı'));
    }
  }
);

export const getOrderByNumber = createAsyncThunk<orderApi.OrderResponse, string>(
  'order/getOrderByNumber',
  async (orderNumber, { rejectWithValue }) => {
    try {
      return await orderApi.getOrderByNumber(orderNumber);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Sipariş bulunamadı'));
    }
  }
);

export const updatePaymentStatus = createAsyncThunk<orderApi.OrderResponse, { orderId: number; paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' }>(
  'order/updatePaymentStatus',
  async (payload, { rejectWithValue }) => {
    try {
      return await orderApi.updatePaymentStatus(payload.orderId, payload.paymentStatus);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Ödeme durumu güncellenemedi'));
    }
  }
);

export const cancelOrder = createAsyncThunk<orderApi.OrderResponse, { orderId: number; reason: string }>(
  'order/cancelOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return await orderApi.cancelOrder(payload.orderId, payload.reason);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'İptal işlemi başarısız'));
    }
  }
);

// --- Slice ---
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCurrentOrder: (state) => { state.currentOrder = null; },
  },
 extraReducers: (builder) => {
    builder
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload.content as unknown as Order[];
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload as unknown as Order;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload as unknown as Order;
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Hata burada çözülüyor: action tipini PayloadAction<string> olarak belirttik
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload || 'Bir hata oluştu';
        }
      );
  },
});

export const { clearError, clearCurrentOrder } = orderSlice.actions;

// --- Selectors ---
export const selectCurrentOrder = (state: RootState) => state.order.currentOrder;
export const selectUserOrders = (state: RootState) => state.order.userOrders;
export const selectOrderLoading = (state: RootState) => state.order.loading;
export const selectOrderError = (state: RootState) => state.order.error;
export const selectOrderTotalPages = (state: RootState) => state.order.totalPages;
export const selectOrderCurrentPage = (state: RootState) => state.order.currentPage;
export const selectOrderTotalElements = (state: RootState) => state.order.totalElements;

export default orderSlice.reducer;