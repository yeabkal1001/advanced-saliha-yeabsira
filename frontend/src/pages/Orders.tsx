import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ClipboardList, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
  Hash,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

const Orders = () => {
  const { orders, loading, error, getUserOrders, refreshOrders } = useOrders();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (user) {
      refreshOrders();
    }
  }, [user]);

  const userOrders = getUserOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = (status: string, trackingNumber?: string, estimatedDelivery?: string) => {
    switch (status) {
      case 'pending':
        return {
          message: '⏳ Your order is pending confirmation from the seller.',
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'confirmed':
        return {
          message: '✅ Your order has been confirmed and will be processed soon.',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800'
        };
      case 'processing':
        return {
          message: '📦 Your order is being prepared for shipment.',
          bgColor: 'bg-purple-50 border-purple-200',
          textColor: 'text-purple-800'
        };
      case 'shipped':
        return {
          message: trackingNumber 
            ? `🚚 Your order has been shipped! Tracking: ${trackingNumber}${estimatedDelivery ? ` | ETA: ${new Date(estimatedDelivery).toLocaleDateString()}` : ''}`
            : '🚚 Your order has been shipped and is on its way!',
          bgColor: 'bg-indigo-50 border-indigo-200',
          textColor: 'text-indigo-800'
        };
      case 'delivered':
        return {
          message: '🎉 Your order has been delivered! We hope you love your purchase.',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800'
        };
      case 'cancelled':
        return {
          message: '❌ This order has been cancelled.',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800'
        };
      default:
        return {
          message: 'Order status updated.',
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">My Orders</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">My Orders</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshOrders}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={refreshOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        {userOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-50 p-8 rounded-full mb-6">
              <ClipboardList className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              You haven't placed any orders yet. Start shopping to see your order history here!
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {userOrders.map((order, index) => {
              const statusInfo = getStatusMessage(order.status, order.tracking_number, order.estimated_delivery);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="bg-white border-blue-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            {order.order_number || `Order ${order.id}`}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            {order.shipping_address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate max-w-xs">{order.shipping_address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <Badge className={`${getStatusColor(order.status)} mb-2 border`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                            <p className="text-lg font-bold text-blue-600">
                              ${(parseFloat(order.total_amount) || 0).toFixed(2)}
                            </p>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Order Details - {order.order_number || order.id}</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="font-medium">Order Date</Label>
                                      <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <Label className="font-medium">Status</Label>
                                      <Badge className={`${getStatusColor(selectedOrder.status)} border mt-1`}>
                                        {getStatusIcon(selectedOrder.status)}
                                        <span className="ml-1 capitalize">{selectedOrder.status}</span>
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  {selectedOrder.shipping_address && (
                                    <div>
                                      <Label className="font-medium">Shipping Address</Label>
                                      <p className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {selectedOrder.shipping_address}
                                      </p>
                                    </div>
                                  )}

                                  {selectedOrder.tracking_number && (
                                    <div>
                                      <Label className="font-medium">Tracking Number</Label>
                                      <p className="font-mono bg-gray-100 p-2 rounded">{selectedOrder.tracking_number}</p>
                                    </div>
                                  )}

                                  {selectedOrder.estimated_delivery && (
                                    <div>
                                      <Label className="font-medium">Estimated Delivery</Label>
                                      <p>{new Date(selectedOrder.estimated_delivery).toLocaleDateString()}</p>
                                    </div>
                                  )}

                                  <div>
                                    <Label className="font-medium">Items ({selectedOrder.order_items?.length || 0})</Label>
                                    <div className="space-y-3 mt-2 max-h-60 overflow-y-auto">
                                      {selectedOrder.order_items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                          <img 
                                            src={item.product.image_url} 
                                            alt={item.product.title}
                                            className="w-16 h-16 object-cover rounded"
                                          />
                                          <div className="flex-1">
                                            <p className="font-medium">{item.product.title}</p>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            <p className="text-sm text-gray-600">Price: ${item.price}</p>
                                          </div>
                                          <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {selectedOrder.notes && (
                                    <div>
                                      <Label className="font-medium">Order Notes</Label>
                                      <p className="p-2 bg-blue-50 rounded text-sm">{selectedOrder.notes}</p>
                                    </div>
                                  )}

                                  <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">Total</span>
                                      <span className="text-xl font-bold text-blue-600">
                                        ${(parseFloat(selectedOrder.total_amount) || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        {order.order_items?.slice(0, 3).map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={item.product.image_url}
                              alt={item.product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.product.title}</h4>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                        {order.order_items && order.order_items.length > 3 && (
                          <p className="text-sm text-gray-600 text-center">
                            +{order.order_items.length - 3} more item{order.order_items.length - 3 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      <div className={`p-3 border rounded-lg ${statusInfo.bgColor}`}>
                        <p className={`text-sm ${statusInfo.textColor}`}>
                          {statusInfo.message}
                        </p>
                      </div>

                      {order.notes && (
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <p className="text-sm flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 mt-0.5 text-blue-600" />
                            <span><strong>Notes:</strong> {order.notes}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;