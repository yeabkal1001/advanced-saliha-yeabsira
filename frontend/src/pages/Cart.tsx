import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, placeOrder } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (!shippingAddress.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your shipping address.",
        variant: "destructive"
      });
      return;
    }

    placeOrder(shippingAddress);
    toast({
      title: "Order placed!",
      description: "Your order has been successfully placed. Sellers have been notified.",
    });
    setIsCheckoutOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold">Shopping Cart</h1>
        {cart.length > 0 && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </span>
        )}
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-50 p-8 rounded-full mb-6">
              <ShoppingCart className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Looks like you haven't added any products to your cart yet. Start shopping to fill it up!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link to="/products">
                Start Shopping
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-white border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Link to={`/product/${item.product.id}`}>
                            <img
                              src={item.product.image_url}
                              alt={item.product.title}
                              className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                            />
                          </Link>
                          
                          <div className="flex-1">
                            <Link 
                              to={`/product/${item.product.id}`}
                              className="font-semibold hover:text-blue-600 transition-colors"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">{item.product.category}</p>
                            <p className="text-sm text-gray-500">by {item.product.user.name}</p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={14} />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock_quantity}
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-lg">
                                  ${(item.product.price * item.quantity).toFixed(2)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
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

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="bg-white border-blue-200 sticky top-24">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="text-green-600">Free</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-blue-600">${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            size="lg"
                          >
                            Proceed to Checkout
                            <ArrowRight className="ml-2" size={20} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Checkout</DialogTitle>
                            <DialogDescription>
                              Please enter your shipping address to complete your order.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="address">Shipping Address</Label>
                              <Input
                                id="address"
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                placeholder="Enter your shipping address"
                                required
                              />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <span className="font-medium">Total:</span>
                              <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
                            </div>
                            <Button
                              onClick={handleCheckout}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              size="lg"
                            >
                              Place Order
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;