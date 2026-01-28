import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/axiosInstance';
import type { RootState } from '../../app/store';
import axios from 'axios';

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// ✅ Sepeti API'den çek
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<{
        success: boolean;
        data: Cart;
        message: string;
      }>(`/v1/cart/${userId}`);

      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: unknown) {
      let errorMessage = 'Sepet yüklenemedi';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Sepete ürün ekle
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    payload: { userId: number; productId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<{
        success: boolean;
        data: Cart;
        message: string;
      }>(`/v1/cart/${payload.userId}/add`, {
        productId: payload.productId,
        quantity: payload.quantity,
      });

      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: unknown) {
      let errorMessage = 'Ürün eklenemedi';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Sepetteki ürünü güncelle
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (
    payload: { userId: number; cartItemId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put<{
        success: boolean;
        data: Cart;
        message: string;
      }>(`/api/v1/cart/${payload.userId}/items/${payload.cartItemId}`, {
        quantity: payload.quantity,
      });

      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: unknown) {
      let errorMessage = 'Güncelleme başarısız';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Sepetten ürün sil
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (
    payload: { userId: number; cartItemId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.delete<{
        success: boolean;
        data: Cart;
        message: string;
      }>(`/api/v1/cart/${payload.userId}/items/${payload.cartItemId}`);

      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: unknown) {
      let errorMessage = 'Silme başarısız';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Sepeti tamamen temizle
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete<{
        success: boolean;
        message: string;
      }>(`/api/v1/cart/${userId}`);

      if (response.data.success) {
        return null;
      }
      return rejectWithValue(response.data.message);
    } catch (error: unknown) {
      let errorMessage = 'Sepet temizlenemedi';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // addToCart
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateCartItem
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateCartItem.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.loading = false;
          state.cart = action.payload;
        }
      )
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // removeFromCart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        removeFromCart.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.loading = false;
          state.cart = action.payload;
        }
      )
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // clearCart
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.cart = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ✅ Selectors
export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartItems = (state: RootState) => state.cart.cart?.items || [];
export const selectCartTotals = (state: RootState) => ({
  totalPrice: state.cart.cart?.totalPrice || 0,
  totalQuantity: state.cart.cart?.totalQuantity || 0,
});
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;

export const { clearError } = cartSlice.actions;

export default cartSlice.reducer;