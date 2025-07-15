import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import { productsAPI, ordersAPI } from '@/lib/api';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  user_id: string;
  user: {
    id: string;
    name: string;
  };
  reviews: Array<{
    rating: number;
    comment: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  shipping_address: string;
}

interface ProductContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  myListings: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  placeOrder: (shippingAddress: string) => void;
  getSellerOrders: (sellerId: string) => Order[];
  refreshProducts: () => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications();
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const myListings = products.filter(p => p.user_id === user?.id);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
      addNotification({
        type: 'message',
        title: 'Error',
        message: 'Failed to load products. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    const token = localStorage.getItem('authToken');
    if (!user || !token) {
      console.log('User not authenticated or token missing, skipping orders fetch');
      return;
    }
    
    try {
      console.log('Fetching orders for user:', user.id);
      const response = await ordersAPI.getAll();
      setOrders(response.data);
      console.log('Orders fetched successfully:', response.data);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      // Don't show error notification for 401 errors as they're handled by the interceptor
      if (err.response?.status !== 401) {
        addNotification({
          type: 'message',
          title: 'Error',
          message: 'Failed to load orders. Please try again.'
        });
      }
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Note: Orders are now handled by OrderProvider, not ProductProvider
  // useEffect(() => {
  //   if (user && !authLoading) {
  //     fetchOrders();
  //   }
  // }, [user, authLoading]);

  const refreshProducts = () => {
    fetchProducts();
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const response = await productsAPI.create(productData);
      const newProduct = response.data;
      setProducts(prev => [newProduct, ...prev]);
      addNotification({
        type: 'message',
        title: 'Success',
        message: 'Product added successfully!'
      });
    } catch (err) {
      console.error('Failed to add product:', err);
      addNotification({
        type: 'message',
        title: 'Error',
        message: 'Failed to add product. Please try again.'
      });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const response = await productsAPI.update(parseInt(id), updates);
      const updatedProduct = response.data;
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? updatedProduct : product
        )
      );
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Product updated successfully!'
      });
    } catch (err) {
      console.error('Failed to update product:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update product. Please try again.'
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await productsAPI.delete(parseInt(productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      // Also remove from cart if present
      setCart(prev => prev.filter(item => item.product.id !== productId));
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Product deleted successfully!'
      });
    } catch (err) {
      console.error('Failed to delete product:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete product. Please try again.'
      });
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.title} added to cart!`
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const placeOrder = async (shippingAddress: string) => {
    if (cart.length === 0 || !user) return;

    try {
      // Prepare order data for backend
      const orderItems = cart.map(item => ({
        product_id: parseInt(item.product.id),
        quantity: item.quantity
      }));

      const orderData = {
        shipping_address: shippingAddress,
        billing_address: shippingAddress, // Use shipping address as billing address
        order_items: orderItems
      };

      // Create order in backend
      const response = await ordersAPI.create(orderData);
      const newOrder = response.data;

      // Add to local orders state
      setOrders(prev => [newOrder, ...prev]);

      // Notify sellers about new orders
      const sellerNotifications = new Map<string, CartItem[]>();
      cart.forEach(item => {
        const sellerId = item.product.user_id;
        if (!sellerNotifications.has(sellerId)) {
          sellerNotifications.set(sellerId, []);
        }
        sellerNotifications.get(sellerId)!.push(item);
      });

      sellerNotifications.forEach((items, sellerId) => {
        if (sellerId === user.id) { // Only notify if current user is the seller
          items.forEach(item => {
            addNotification({
              type: 'order',
              title: 'New Order Received!',
              message: `Someone just ordered your ${item.product.title} (Qty: ${item.quantity})`,
              orderId: newOrder.id
            });
          });
        }
      });

      // Update stock in local state
      setProducts(prev =>
        prev.map(product => {
          const cartItem = cart.find(item => item.product.id === product.id);
          if (cartItem) {
            return { ...product, stock_quantity: product.stock_quantity - cartItem.quantity };
          }
          return product;
        })
      );

      clearCart();
      addNotification({
        type: 'success',
        title: 'Order Placed!',
        message: 'Your order has been placed successfully!'
      });
    } catch (err) {
      console.error('Failed to place order:', err);
      addNotification({
        type: 'error',
        title: 'Order Failed',
        message: 'Failed to place order. Please try again.'
      });
    }
  };

  const getSellerOrders = (sellerId: string): Order[] => {
    return orders.filter(order =>
      order.items.some(item => item.product.user_id === sellerId)
    );
  };

  return (
    <ProductContext.Provider value={{
      products,
      cart,
      orders,
      myListings,
      loading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartTotal,
      placeOrder,
      getSellerOrders,
      refreshProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};