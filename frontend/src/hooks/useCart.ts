import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  clearError,
  selectCart,
  selectCartItems,
  selectCartTotals,
  selectCartLoading,
  selectCartError,
  selectCartSyncInProgress,
  selectIsCartInitialized,
  selectIsCartEmpty,
  selectCartItemCount,
} from '../features/cart/cart.slice';
import { selectAuthUser, selectIsAuthenticated } from '../features/auth/auth.slice';

export function useCart() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const userId = user?.id;
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Redux state
  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectCartItems);
  const totals = useAppSelector(selectCartTotals);
  const loading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);
  const syncInProgress = useAppSelector(selectCartSyncInProgress);
  const isInitialized = useAppSelector(selectIsCartInitialized);
  const isEmpty = useAppSelector(selectIsCartEmpty);
  const itemCount = useAppSelector(selectCartItemCount);

  const initReference = useRef(false);

  // Auto load on mount
  useEffect(() => {
    if (
      isAuthenticated &&
      userId &&
      !initReference.current &&
      !isInitialized
    ) {
      initReference.current = true;
      dispatch(fetchCart(userId));
    }
  }, [isAuthenticated, userId, isInitialized, dispatch]);

  // Add Item
  const addItem = useCallback(
    (productId: number, quantity: number = 1) => {
      if (!userId) return;

      dispatch(
        addToCart({
          userId,
          productId,
          quantity,
        })
      );
    },
    [userId, dispatch]
  );

  // Update Item
  const updateItem = useCallback(
    (cartItemId: number, quantity: number) => {
      if (!userId || quantity < 1) return;

      dispatch(
        updateCartItem({
          userId,
          cartItemId,
          quantity,
        })
      );
    },
    [userId, dispatch]
  );

  // Remove Item
  const removeItem = useCallback(
    (cartItemId: number) => {
      if (!userId) return;

      dispatch(
        removeFromCart({
          userId,
          cartItemId,
        })
      );
    },
    [userId, dispatch]
  );

  // Increment
  const increment = useCallback(
    (cartItemId: number) => {
      if (!userId) return;

      const item = items.find((i) => i.id === cartItemId);
      if (!item) return;

      dispatch(
        updateCartItem({
          userId,
          cartItemId,
          quantity: item.quantity + 1,
        })
      );
    },
    [items, userId, dispatch]
  );

  // Decrement
  const decrement = useCallback(
    (cartItemId: number) => {
      if (!userId) return;

      const item = items.find((i) => i.id === cartItemId);
      if (!item || item.quantity <= 1) return;

      dispatch(
        updateCartItem({
          userId,
          cartItemId,
          quantity: item.quantity - 1,
        })
      );
    },
    [items, userId, dispatch]
  );

  // Clear Cart
  const clear = useCallback(async () => {
    if (!userId) return false;

    try {
      await dispatch(clearCart(userId)).unwrap();
      return true;
    } catch {
      return false;
    }
  }, [userId, dispatch]);

  // Clear Error
  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Calculate Shipping
  const calculateShipping = useCallback(
    (threshold: number = 500, cost: number = 50) => {
      return totals.totalPrice >= threshold ? 0 : cost;
    },
    [totals.totalPrice]
  );

  // Calculate Total
  const calculateTotal = useCallback(
    (threshold: number = 500, cost: number = 50) => {
      const shipping = calculateShipping(threshold, cost);
      return totals.totalPrice + shipping;
    },
    [totals.totalPrice, calculateShipping]
  );

  return {
    // State
    cart,
    items,
    totals,
    loading,
    error,
    syncInProgress,
    isInitialized,
    isEmpty,
    itemCount,

    // Actions (Eski API Uyumlu)
    addItem,
    updateItem,
    removeItem,
    clearErrorMessage,

    // New Actions
    increment,
    decrement,
    clear,

    // Utilities
    calculateShipping,
    calculateTotal,
  };
}
