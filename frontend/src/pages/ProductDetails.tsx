import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductReviews } from '../components/ProductReviews';
import { useProducts } from '../contexts/ProductContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useProducts();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id.toString() === id);

  if (!product) {
    return (
      <div className="flex flex-col h-full w-full">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
          <SidebarTrigger />
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </Button>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Product not found</p>
        </main>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to cart!",
      description: `${quantity} ${product.title}${quantity > 1 ? 's' : ''} added to your cart.`,
    });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.title} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product.id);
      toast({
        title: "Added to wishlist!",
        description: `${product.title} has been added to your wishlist.`,
      });
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    // Add to cart and navigate to checkout
    addToCart(product, quantity);
    navigate('/checkout');
  };

  // Calculate average rating from reviews
  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0;

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </Button>
        <h1 className="text-xl font-semibold truncate">{product.title}</h1>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Badge className="mb-3">{product.category}</Badge>
                <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviews.length} reviews)</span>
                </div>

                <div className="text-4xl font-bold text-blue-600 mb-4">
                  ${product.price}
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {product.description}
                </p>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-gray-600">Sold by:</span>
                  <span className="font-medium text-blue-600">{product.user.name}</span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-gray-700 font-medium">Quantity:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2" size={20} />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  
                  <Button
                    onClick={handleBuyNow}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    size="lg"
                  >
                    <Truck className="mr-2" size={20} />
                    Buy Now
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleWishlistToggle}
                    size="lg"
                    className={isInWishlist(product.id) ? 'text-pink-600 border-pink-600' : ''}
                  >
                    <Heart 
                      size={20} 
                      className={isInWishlist(product.id) ? 'fill-current' : ''} 
                    />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Free Shipping</p>
                    <p className="text-xs text-gray-600">On orders over $50</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Secure Payment</p>
                    <p className="text-xs text-gray-600">100% protected</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <RotateCcw className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Easy Returns</p>
                    <p className="text-xs text-gray-600">30-day policy</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {product.description}
                      </p>
                      <p className="text-gray-700 leading-relaxed mt-4">
                        This high-quality product is designed to meet your needs with exceptional performance and durability. 
                        Crafted with attention to detail, it offers excellent value for money and comes with our satisfaction guarantee.
                      </p>
                      <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
                        <li>Premium quality materials</li>
                        <li>Excellent customer support</li>
                        <li>Fast and reliable shipping</li>
                        <li>30-day money-back guarantee</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Category</span>
                          <span>{product.category}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Brand</span>
                          <span>{product.user.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Stock</span>
                          <span>{product.stock_quantity} units</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Rating</span>
                          <span>{averageRating.toFixed(1)}/5 stars</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Weight</span>
                          <span>1.2 lbs</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Dimensions</span>
                          <span>10" x 8" x 3"</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Warranty</span>
                          <span>1 Year</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Color</span>
                          <span>Multiple Options</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <ProductReviews productId={product.id} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;