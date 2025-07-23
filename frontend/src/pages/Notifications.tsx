import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, Clock } from 'lucide-react';

const Notifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed and is being processed.',
      type: 'success',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: 2,
      title: 'Product Back in Stock',
      message: 'Wireless Bluetooth Headphones is back in stock!',
      type: 'info',
      timestamp: '1 day ago',
      read: true
    },
    {
      id: 3,
      title: 'Review Request',
      message: 'How was your recent purchase? Leave a review!',
      type: 'warning',
      timestamp: '3 days ago',
      read: false
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Bell className="text-blue-500" size={20} />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>
        <Button variant="outline">
          Mark all as read
        </Button>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all duration-200 ${!notification.read ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <Badge className={getBadgeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{notification.timestamp}</span>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button size="sm" variant="outline">
                              Mark as read
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notifications;