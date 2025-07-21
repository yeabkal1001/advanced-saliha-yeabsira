import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Truck,
  AlertCircle,
  DollarSign,
  Eye,
  Edit,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  MapPin,
  Hash,
  MessageSquare,
  User,
  Phone,
  Mail,
  Download,
  Printer
} from 'lucide-react';

const OrderManagement: React.FC = () => {
  const { sellerOrders, sellerStats, loading, error, updateOrderStatus, refreshOrders } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    tracking_number: '',
    estimated_delivery: '',
    seller_notes: ''
  });

  useEffect(() => {
    if (user) {
      refreshOrders();
    }
  }, [user]);

  const filteredOrders = sellerOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      (order.order_number || order.id.toString()).toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const diffInDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = diffInDays < 1;
          break;
        case 'week':
          matchesDate = diffInDays < 7;
          break;
        case 'month':
          matchesDate = diffInDays < 30;
          break;
      }
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

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
        return <Package className="h-4 w-4" />;
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

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    setIsUpdating(true);
    try {
      await updateOrderStatus({
        orderId: selectedOrder.id,
        status: updateData.status as any,
        tracking_number: updateData.tracking_number,
        estimated_delivery: updateData.estimated_delivery,
        seller_notes: updateData.seller_notes
      });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      setSelectedOrder(null);
      refreshOrders();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openUpdateDialog = (order: any) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      tracking_number: order.tracking_number || '',
      estimated_delivery: order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : '',
      seller_notes: order.seller_notes || ''
    });
  };

  const getStatusOptions = (currentStatus: string) => {
    const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    // Allow moving forward in the flow or cancelling
    const availableStatuses = [
      ...statusFlow.slice(currentIndex),
      'cancelled'
    ];
    
    return availableStatuses.filter(status => status !== currentStatus);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">Order Management</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading orders...</p>
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
          <h1 className="text-2xl font-semibold">Order Management</h1>
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
        <h1 className="text-2xl font-semibold">Order Management</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        {/* Stats Overview */}
        {sellerStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold">{sellerStats.total_orders}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Revenue</p>
                    <p className="text-2xl font-bold">${parseFloat(sellerStats.total_revenue).toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Pending</p>
                    <p className="text-2xl font-bold">{sellerStats.pending_orders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Delivered</p>
                    <p className="text-2xl font-bold">{sellerStats.delivered_orders}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto text-sm text-gray-600">
                {filteredOrders.length} of {sellerOrders.length} orders
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-gray-600">
                {sellerOrders.length === 0 
                  ? "You haven't received any orders yet." 
                  : "No orders match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            {order.order_number || `Order ${order.id}`}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {order.user?.name || 'Unknown Customer'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold text-lg text-blue-600">
                            ${parseFloat(order.total_amount || '0').toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openUpdateDialog(order)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Manage Order - {order.order_number || order.id}</DialogTitle>
                            </DialogHeader>
                            
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="details">Order Details</TabsTrigger>
                                <TabsTrigger value="customer">Customer Info</TabsTrigger>
                                <TabsTrigger value="update">Update Status</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">Order Date</Label>
                                    <p>{new Date(order.created_at).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Current Status</Label>
                                    <Badge className={`${getStatusColor(order.status)} border mt-1`}>
                                      {getStatusIcon(order.status)}
                                      <span className="ml-1 capitalize">{order.status}</span>
                                    </Badge>
                                  </div>
                                </div>
                                
                                {order.shipping_address && (
                                  <div>
                                    <Label className="font-medium">Shipping Address</Label>
                                    <p className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {order.shipping_address}
                                    </p>
                                  </div>
                                )}

                                <div>
                                  <Label className="font-medium">Items ({order.order_items?.length || 0})</Label>
                                  <div className="space-y-3 mt-2 max-h-60 overflow-y-auto">
                                    {order.order_items?.map((item: any) => (
                                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                        <img 
                                          src={item.product.image_url} 
                                          alt={item.product.title}
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                          <p className="font-medium">{item.product.title}</p>
                                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                          <p className="text-sm text-gray-600">Price: ${parseFloat(item.price).toFixed(2)}</p>
                                        </div>
                                        <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="customer" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">Customer Name</Label>
                                    <p className="flex items-center gap-1">
                                      <User className="h-4 w-4" />
                                      {order.user?.name || 'Unknown Customer'}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Email</Label>
                                    <p className="flex items-center gap-1">
                                      <Mail className="h-4 w-4" />
                                      {order.user?.email || 'No email provided'}
                                    </p>
                                  </div>
                                </div>
                                
                                {order.notes && (
                                  <div>
                                    <Label className="font-medium">Customer Notes</Label>
                                    <p className="p-2 bg-blue-50 rounded text-sm">{order.notes}</p>
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="update" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="status">Update Status</Label>
                                    <Select value={updateData.status} onValueChange={(value) => setUpdateData({...updateData, status: value})}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getStatusOptions(order.status).map(status => (
                                          <SelectItem key={status} value={status}>
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(status)}
                                              <span className="capitalize">{status}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="tracking">Tracking Number</Label>
                                    <Input
                                      id="tracking"
                                      value={updateData.tracking_number}
                                      onChange={(e) => setUpdateData({...updateData, tracking_number: e.target.value})}
                                      placeholder="Enter tracking number"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="delivery">Estimated Delivery Date</Label>
                                  <Input
                                    id="delivery"
                                    type="date"
                                    value={updateData.estimated_delivery}
                                    onChange={(e) => setUpdateData({...updateData, estimated_delivery: e.target.value})}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="notes">Seller Notes</Label>
                                  <Textarea
                                    id="notes"
                                    value={updateData.seller_notes}
                                    onChange={(e) => setUpdateData({...updateData, seller_notes: e.target.value})}
                                    placeholder="Add notes for internal use..."
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-4">
                                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdateOrder} disabled={isUpdating}>
                                    {isUpdating ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      'Update Order'
                                    )}
                                  </Button>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {order.order_items?.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product.title}</p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.order_items && order.order_items.length > 3 && (
                        <div className="flex items-center justify-center p-2 bg-gray-100 rounded text-sm text-gray-600">
                          +{order.order_items.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {order.tracking_number && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            <span>Tracking: {order.tracking_number}</span>
                          </div>
                        )}
                        {order.estimated_delivery && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>ETA: {new Date(order.estimated_delivery).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <Button size="sm" onClick={() => {
                            setSelectedOrder(order);
                            setUpdateData({...updateData, status: 'confirmed'});
                            handleUpdateOrder();
                          }}>
                            Confirm Order
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button size="sm" onClick={() => {
                            setSelectedOrder(order);
                            setUpdateData({...updateData, status: 'processing'});
                            handleUpdateOrder();
                          }}>
                            Start Processing
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderManagement;