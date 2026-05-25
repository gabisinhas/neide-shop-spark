import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Order, OrderAddress, OrderStatus } from '@/domain/entities/Order';
import { ShippingService } from '@/domain/entities/Shipping';
import { CartItem } from '@/domain/entities/CartItem';
import { User } from '@/domain/entities/User';
import { isAdminRole } from '@/domain/entities/role';
import { useAuth } from './AuthContext';
import { apiRequest, formatApiError } from '@/shared/api/httpClient';

type CreateOrderInput = {
  user: User;
  items: CartItem[];
  paymentMethod: Order['paymentMethod'];
  address: OrderAddress;
  shippingService: ShippingService;
};

interface OrderContextType {
  orders: Order[];
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrdersByUser: (userId: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setOrders([]);
        return;
      }

      try {
        const path = isAdminRole(currentUser.role) ? '/orders' : `/orders?userId=${encodeURIComponent(currentUser.id)}`;
        const response = await apiRequest<Order[]>(path);
        setOrders(response);
      } catch (error) {
        console.error({ scope: 'OrderContext.fetchOrders', error, userId: currentUser.id });
      }
    };

    if (!isLoading) {
      void fetchOrders();
    }
  }, [currentUser, isLoading]);

  const createOrder = async ({ user, items, paymentMethod, address, shippingService }: CreateOrderInput) => {
    try {
      const order = await apiRequest<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          items,
          paymentMethod,
          address,
          shippingService,
        }),
      });

      setOrders((currentOrders) => [order, ...currentOrders.filter((currentOrder) => currentOrder.id !== order.id)]);
      return order;
    } catch (error) {
      console.error({ scope: 'OrderContext.createOrder', error, userId: user.id, paymentMethod, shippingService });
      throw new Error(formatApiError(error, 'Nao foi possivel criar seu pedido.'));
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updatedOrder = await apiRequest<Order>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
      );
    } catch (error) {
      console.error({ scope: 'OrderContext.updateOrderStatus', error, orderId, status });
      throw new Error(formatApiError(error, 'Nao foi possivel atualizar o status do pedido.'));
    }
  };

  const getOrdersByUser = (userId: string) => orders.filter((order) => order.userId === userId);

  const value = useMemo(
    () => ({
      orders,
      createOrder,
      updateOrderStatus,
      getOrdersByUser,
    }),
    [orders],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
}
