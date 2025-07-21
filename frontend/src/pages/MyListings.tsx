import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '../contexts/ProductContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useToast } from '../hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Bell } from 'lucide-react';

const MyListings = () => {
  const { myListings, deleteProduct } = useProducts();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { toast } = useToast();

  const handleDelete = (productId: string, productTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      deleteProduct(productId);
      toast({
        title: "Product deleted",
        description: "Your product has been removed from listings.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center justify-between sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">My Listings</h1>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <Bell size={16} />
              {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link to="/add-product">
            <Plus className="mr-2" size={16} />
            Add Product
          </Link>
        </Button>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        {/* Notifications Section */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Recent Notifications</h2>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className={`border-l-4 ${
                    notification.type === 'order' ? 'border-l-green-500 bg-green-50' : 'border-l-blue-500 bg-blue-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge variant="destructive" className="text-xs">New</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {myListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-50 p-8 rounded-full mb-6">
              <Plus className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No products listed yet</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Start selling by adding your first product. It's easy and takes just a few minutes!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link to="/add-product">
                <Plus className="mr-2" size={20} />
                Add Your First Product
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                You have {myListings.length} product{myListings.length !== 1 ? 's' : ''} listed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-blue-200">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                        <div className="text-sm text-gray-500">
                          {product.reviews} reviews
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link to={`/product/${product.id}`}>
                            <Eye size={14} className="mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/edit-product/${product.id}`}>
                            <Edit size={14} />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(product.id, product.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyListings;