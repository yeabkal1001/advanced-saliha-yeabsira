import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useOrders } from '../contexts/OrderContext';
import { 
  ShoppingBag, 
  Home, 
  Package, 
  Plus, 
  ShoppingCart, 
  ClipboardList, 
  User,
  Store,
  LogOut,
  Search,
  Heart,
  Settings,
  Truck
} from 'lucide-react';

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { wishlist } = useWishlist();
  const { sellerOrders } = useOrders();
  
  const pendingOrders = sellerOrders.filter(order => order.status === 'pending').length;
  
  const shopItems = [
    { title: 'Home', icon: Home, href: '/' },
    { title: 'Search', icon: Search, href: '/search' },
    { title: 'Browse Products', icon: Package, href: '/products' },
    { title: 'Wishlist', icon: Heart, href: '/wishlist', badge: wishlist.length },
    { title: 'My Cart', icon: ShoppingCart, href: '/cart' },
    { title: 'My Orders', icon: ClipboardList, href: '/orders' },
  ];

  const sellingItems = [
    { title: 'My Store', icon: Store, href: '/my-listings' },
    { title: 'Add Product', icon: Plus, href: '/add-product' },
    { title: 'Order Management', icon: Truck, href: '/order-management', badge: pendingOrders },
  ];

  const accountItems = [
    { title: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <Sidebar className="border-r border-blue-200 bg-white/80 backdrop-blur-sm">
      <SidebarHeader className="border-b border-blue-200">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ShopEase
            </h1>
            <p className="text-xs text-gray-500">Welcome, {user?.name}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Shopping</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {shopItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="secondary" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>My Store</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sellingItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-blue-200 p-4">
        <Button
          variant="outline"
          onClick={logout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}