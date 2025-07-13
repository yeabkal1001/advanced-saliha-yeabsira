import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ProductProvider } from "./contexts/ProductContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { SearchProvider } from "./contexts/SearchContext";
import { ReviewProvider } from "./contexts/ReviewContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import OrderNotifications from "./components/OrderNotifications";
import Index from "@/pages/Index";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import MyListings from "@/pages/MyListings";
import AddProduct from "@/pages/AddProduct";
import EditProduct from "@/pages/EditProduct";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import OrderManagement from "@/pages/OrderManagement";
import Profile from "@/pages/Profile";
import Wishlist from "@/pages/Wishlist";
import Search from "@/pages/Search";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <SearchProvider>
                <ReviewProvider>
                  <OrderProvider>
                    <ProductProvider>
                      <BrowserRouter>
                        <Routes>
                          {/* Public routes */}
                          <Route path="/signin" element={<SignIn />} />
                          <Route path="/signup" element={<SignUp />} />
                          
                          {/* Protected routes */}
                          <Route path="/*" element={
                            <ProtectedRoute>
                              <SidebarProvider>
                                <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
                                  <AppSidebar />
                                  <SidebarInset className="flex-1 w-full min-w-0">
                                    <Toaster />
                                    <Sonner />
                                    <OrderNotifications />
                                    <Routes>
                                      <Route path="/" element={<Index />} />
                                      <Route path="/products" element={<Products />} />
                                      <Route path="/product/:id" element={<ProductDetails />} />
                                      <Route path="/my-listings" element={<MyListings />} />
                                      <Route path="/add-product" element={<AddProduct />} />
                                      <Route path="/edit-product/:id" element={<EditProduct />} />
                                      <Route path="/cart" element={<Cart />} />
                                      <Route path="/orders" element={<Orders />} />
                                      <Route path="/order-management" element={<OrderManagement />} />
                                      <Route path="/profile" element={<Profile />} />
                                      <Route path="/wishlist" element={<Wishlist />} />
                                      <Route path="/search" element={<Search />} />
                                      <Route path="*" element={<NotFound />} />
                                    </Routes>
                                  </SidebarInset>
                                </div>
                              </SidebarProvider>
                            </ProtectedRoute>
                          } />
                          
                          {/* Default redirect to signup */}
                          <Route path="*" element={<Navigate to="/signup" replace />} />
                        </Routes>
                      </BrowserRouter>
                    </ProductProvider>
                  </OrderProvider>
                </ReviewProvider>
              </SearchProvider>
            </WishlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;