import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from './ProductContext';
import { ordersAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    title: string;
    price: number;
    image_url: string;
  };
}

export interface Order {
  id: number;
  user_id?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order_items: OrderItem[];
  total_amount?: number;
  seller_total?: number;
  total_items?: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  shipping_address: string;
  billing_address?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
  seller_notes?: string;
  order_number?: string;
}

export interface OrderUpdate {
  orderId: number;
  status: Order['status'];
  notes?: string;
  seller_notes?: string;
  tracking_number?: string;
  estimated_delivery?: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  recent_orders: Array<{
    id: number;
    order_number: string;
    status: string;
    customer_name: string;
    total: number;
    created_at: string;
  }>;
}

interface OrderContextType {
  orders: Order[];
  sellerOrders: Order[];
  sellerStats: OrderStats | null;
  loading: boolean;
  error: string | null;
  getSellerOrders: () => Promise<void>;
  getSellerStats: () => Promise<void>;
  getUserOrders: () => Order[];
  updateOrderStatus: (update: OrderUpdate) => Promise<void>;
  bulkUpdateOrders: (orderIds: number[], status: string) => Promise<void>;
  getOrderById: (orderId: number) => Order | undefined;
  addOrder: (orderData: {
    shipping_address: string;
    billing_address?: string;
    order_items: Array<{ product_id: number; quantity: number }>;
  }) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [sellerStats, setSellerStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user orders from API
  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      // Don't show error for 401 errors as they're handled by the interceptor
      if (err.response?.status !== 401) {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch seller orders from API
  const fetchSellerOrders = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const response = await ordersAPI.getSellerOrders();
      setSellerOrders(response.data);
    } catch (err: any) {
      console.error('Failed to fetch seller orders:', err);
      // Don't show error for 401 errors as they're handled by the interceptor
      if (err.response?.status !== 401) {
        setError('Failed to load seller orders. Please try again.');
      }
    }
  }, [user]);

  // Fetch seller stats from API
  const fetchSellerStats = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const response = await ordersAPI.getSellerStats();
      setSellerStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch seller stats:', err);
      if (err.response?.status !== 401) {
        setError('Failed to load seller statistics. Please try again.');
      }
    }
  }, [user]);

  // Load orders when user changes
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchSellerOrders();
      fetchSellerStats();
    }
  }, [user]);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
    await fetchSellerOrders();
    await fetchSellerStats();
  }, [fetchOrders, fetchSellerOrders, fetchSellerStats]);

  const getSellerOrders = async () => {
    await fetchSellerOrders();
  };

  const getSellerStats = async () => {
    await fetchSellerStats();
  };

  const getUserOrders = (): Order[] => {
    return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const updateOrderStatus = async (update: OrderUpdate) => {
    try {
      const response = await ordersAPI.update(update.orderId, {
        status: update.status,
        notes: update.notes,
        seller_notes: update.seller_notes,
        tracking_number: update.tracking_number,
        estimated_delivery: update.estimated_delivery
      });
      
      const updatedOrder = response.data;
      setOrders(prev =>
        prev.map(order =>
          order.id === update.orderId
            ? updatedOrder
            : order
        )
      );
      
      // Also update seller orders if this order is in there
      setSellerOrders(prev =>
        prev.map(order =>
          order.id === update.orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      );
      
      // Refresh stats after update
      await fetchSellerStats();
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError('Failed to update order status. Please try again.');
      throw err;
    }
  };

  const bulkUpdateOrders = async (orderIds: number[], status: string) => {
    try {
      await ordersAPI.bulkUpdate(orderIds, status);
      
      // Refresh all data after bulk update
      await refreshOrders();
    } catch (err) {
      console.error('Failed to bulk update orders:', err);
      setError('Failed to bulk update orders. Please try again.');
      throw err;
    }
  };

  const getOrderById = (orderId: number): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const addOrder = async (orderData: {
    shipping_address: string;
    billing_address?: string;
    order_items: Array<{ product_id: number; quantity: number }>;
  }) => {
    try {
      const response = await ordersAPI.create(orderData);
      const newOrder = response.data;
      setOrders(prev => [newOrder, ...prev]);
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to create order. Please try again.');
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      sellerOrders,
      sellerStats,
      loading,
      error,
      getSellerOrders,
      getSellerStats,
      getUserOrders,
      updateOrderStatus,
      bulkUpdateOrders,
      getOrderById,
      addOrder,
      refreshOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};