import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAuthUser } from '../features/auth/auth.slice';
import {
  fetchCart,
  selectCart,
  selectCartItems,
  selectCartTotals,
  selectCartLoading,
  selectCartError,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearError,
} from '../features/cart/cart.slice';

export function useCart() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectCartItems);
  const totals = useAppSelector(selectCartTotals);
  const loading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);

  // ✅ Kullanıcı giriş yaptığında sepeti yükle
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [user?.id, dispatch]);

  // ✅ Sepete ürün ekle
  const addItem = (productId: number, quantity: number) => {
    if (user?.id) {
      dispatch(
        addToCart({
          userId: user.id,
          productId,
          quantity,
        })
      );
    }
  };

  // ✅ Ürün miktarını güncelle
  const updateItem = (cartItemId: number, quantity: number) => {
    if (user?.id) {
      dispatch(
        updateCartItem({
          userId: user.id,
          cartItemId,
          quantity,
        })
      );
    }
  };

  // ✅ Ürünü sepetten sil
  const removeItem = (cartItemId: number) => {
    if (user?.id) {
      dispatch(
        removeFromCart({
          userId: user.id,
          cartItemId,
        })
      );
    }
  };

  // ✅ Hata mesajını temizle
  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  return {
    cart,
    items,
    totals,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearErrorMessage,
  };
}