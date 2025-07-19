import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Heart
} from 'lucide-react';

const SellerDashboard = () => {
  const { products } = useProducts();
  const { getSellerOrders } = useOrders();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');

  const sellerProducts = products.filter(p => p.sellerId === user?.id);
  const sellerOrders = getSellerOrders(user?.id || '1');

  // Calculate metrics
  const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = sellerOrders.length;
  const totalProducts = sellerProducts.length;
  const averageRating = sellerProducts.reduce((sum, p) => sum + p.rating, 0) / sellerProducts.length || 0;

  // Sales data for charts
  const salesData = [
    { month: 'Jan', sales: 4000, orders: 24 },
    { month: 'Feb', sales: 3000, orders: 18 },
    { month: 'Mar', sales: 5000, orders: 32 },
    { month: 'Apr', sales: 4500, orders: 28 },
    { month: 'May', sales: 6000, orders: 38 },
    { month: 'Jun', sales: 5500, orders: 35 },
  ];

  const categoryData = sellerProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const orderStatusData = [
    { status: 'Pending', count: sellerOrders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
    { status: 'Processing', count: sellerOrders.filter(o => o.status === 'processing').length, color: '#8b5cf6' },
    { status: 'Shipped', count: sellerOrders.filter(o => o.status === 'shipped').length, color: '#3b82f6' },
    { status: 'Delivered', count: sellerOrders.filter(o => o.status === 'delivered').length, color: '#10b981' },
  ];

  const topProducts = sellerProducts
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);

  const recentOrders = sellerOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
        <div className="ml-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
            <p className="text-blue-100">Here's how your store is performing</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <TrendingUp size={14} />
                        +12.5% from last month
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
                      <p className="text-sm text-blue-600 flex items-center gap-1">
                        <TrendingUp size={14} />
                        +8.2% from last month
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Products Listed</p>
                      <p className="text-3xl font-bold text-purple-600">{totalProducts}</p>
                      <p className="text-sm text-purple-600 flex items-center gap-1">
                        <Package size={14} />
                        Active listings
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Package className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <p className="text-3xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Order Status & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderStatusData.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.status}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{product.title}</p>
                        <p className="text-sm text-gray-600">{product.reviews} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${product.price}</p>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                        {order.status === 'processing' && <Package className="h-4 w-4 text-blue-600" />}
                        {order.status === 'shipped' && <TrendingUp className="h-4 w-4 text-indigo-600" />}
                        {order.status === 'delivered' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        <span className="font-medium">Order {order.id}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{order.userName}</p>
                        <p className="text-xs text-gray-500">{order.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total.toFixed(2)}</p>
                      <Badge 
                        variant={order.status === 'delivered' ? 'default' : 'secondary'}
                        className={
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-green-100 text-green-800'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="h-20 flex-col">
                  <a href="/add-product">
                    <Package className="h-6 w-6 mb-2" />
                    Add New Product
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <a href="/order-management">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    Manage Orders
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <a href="/my-listings">
                    <Eye className="h-6 w-6 mb-2" />
                    View My Products
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;