import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  X,
  Bell
} from 'lucide-react';

interface OrderNotification {
  id: string;
  orderId: number;
  orderNumber: string;
  message: string;
  type: 'status_change' | 'new_order' | 'delivery_update';
  status: string;
  timestamp: Date;
  read: boolean;
}

const OrderNotifications: React.FC = () => {
  const { sellerOrders } = useOrders();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Simulate real-time notifications (in a real app, this would come from WebSocket or polling)
  useEffect(() => {
    const checkForNewNotifications = () => {
      // This is a simplified version - in production you'd want to track order changes
      const recentOrders = sellerOrders
        .filter(order => {
          const orderDate = new Date(order.updated_at);
          const now = new Date();
          const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
          return diffInHours < 24; // Orders updated in last 24 hours
        })
        .slice(0, 5);

      const newNotifications: OrderNotification[] = recentOrders.map(order => ({
        id: `${order.id}-${order.updated_at}`,
        orderId: order.id,
        orderNumber: order.order_number || `Order ${order.id}`,
        message: getNotificationMessage(order.status, order.user?.name || 'Customer'),
        type: 'status_change',
        status: order.status,
        timestamp: new Date(order.updated_at),
        read: false
      }));

      setNotifications(newNotifications);
    };

    if (sellerOrders.length > 0) {
      checkForNewNotifications();
    }
  }, [sellerOrders]);

  const getNotificationMessage = (status: string, customerName: string): string => {
    switch (status) {
      case 'pending':
        return `New order from ${customerName} is pending confirmation`;
      case 'confirmed':
        return `Order confirmed for ${customerName}`;
      case 'processing':
        return `Order for ${customerName} is now being processed`;
      case 'shipped':
        return `Order for ${customerName} has been shipped`;
      case 'delivered':
        return `Order for ${customerName} has been delivered`;
      case 'cancelled':
        return `Order for ${customerName} has been cancelled`;
      default:
        return `Order status updated for ${customerName}`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'processing':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-indigo-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative mb-2"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-80 max-h-96 overflow-y-auto space-y-2"
          >
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className={`${notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'} shadow-lg`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(notification.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {notification.orderNumber}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderNotifications;