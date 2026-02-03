import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  createOrder,
  getUserOrders,
  getOrder,
  getOrderByNumber,
  updatePaymentStatus,
  cancelOrder,
  selectCurrentOrder,
  selectUserOrders,
  selectOrderLoading,
  selectOrderError,
  selectOrderTotalPages,
  selectOrderCurrentPage,
  selectOrderTotalElements,
  type CreateOrderRequest,
} from '../features/order/order.slice';
import { selectAuthUser } from '../features/auth/auth.slice';

export function useOrder() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const userId = user?.id; // ✅ KRİTİK

  const currentOrder = useAppSelector(selectCurrentOrder);
  const orders = useAppSelector(selectUserOrders);
  const loading = useAppSelector(selectOrderLoading);
  const error = useAppSelector(selectOrderError);
  const totalPages = useAppSelector(selectOrderTotalPages);
  const currentPage = useAppSelector(selectOrderCurrentPage);
  const totalElements = useAppSelector(selectOrderTotalElements);

  const handleCreateOrder = useCallback(
    async (orderData: CreateOrderRequest) => {
      if (!userId) throw new Error('Kullanıcı ID bulunamadı');

      const result = await dispatch(
        createOrder({
          userId,
          orderData,
        })
      ).unwrap();

      return result;
    },
    [userId, dispatch] // ✅ artık %100 doğru
  );

  const handleGetUserOrders = useCallback(
    async (page: number = 1, size: number = 10) => {
      if (!userId) throw new Error('Kullanıcı ID bulunamadı');

      await dispatch(
        getUserOrders({
          userId,
          page: page - 1,
          size,
        })
      ).unwrap();
    },
    [userId, dispatch]
  );

  const handleGetOrder = useCallback(
    async (orderId: number) => {
      if (!userId) throw new Error('Kullanıcı ID bulunamadı');

      const result = await dispatch(
        getOrder({
          userId,
          orderId,
        })
      ).unwrap();

      return result;
    },
    [userId, dispatch]
  );

  const handleGetOrderByNumber = useCallback(
    async (orderNumber: string) => {
      const result = await dispatch(
        getOrderByNumber(orderNumber)
      ).unwrap();

      return result;
    },
    [dispatch]
  );

  const handleUpdatePaymentStatus = useCallback(
    async (
      orderId: number,
      paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
    ) => {
      const result = await dispatch(
        updatePaymentStatus({
          orderId,
          paymentStatus,
        })
      ).unwrap();

      return result;
    },
    [dispatch]
  );

  const handleCancelOrder = useCallback(
    async (orderId: number, reason: string) => {
      const result = await dispatch(
        cancelOrder({
          orderId,
          reason,
        })
      ).unwrap();

      return result;
    },
    [dispatch]
  );

  return {
    currentOrder,
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    totalElements,

    createOrder: handleCreateOrder,
    getUserOrders: handleGetUserOrders,
    getOrder: handleGetOrder,
    getOrderByNumber: handleGetOrderByNumber,
    updatePaymentStatus: handleUpdatePaymentStatus,
    cancelOrder: handleCancelOrder,
  };
}