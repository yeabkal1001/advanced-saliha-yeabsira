import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '../contexts/WishlistContext';
import { useProducts } from '../contexts/ProductContext';
import { useToast } from '../hooks/use-toast';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useProducts();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
    addToCart(product.product);
    toast({
      title: "Added to cart!",
      description: `${product.product.title} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = (product: any) => {
    removeFromWishlist(product.product.id);
    toast({
      title: "Removed from wishlist",
      description: `${product.product.title} has been removed from your wishlist.`,
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold">My Wishlist</h1>
        {wishlist.length > 0 && (
          <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
          </span>
        )}
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-pink-50 p-8 rounded-full mb-6">
              <Heart className="h-16 w-16 text-pink-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Save products you love to your wishlist and come back to them later!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
              <Link to="/products">
                Start Browsing
              </Link>
            </Button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-pink-200">
                    <div className="relative overflow-hidden">
                      <Link to={`/product/${product.product.id}`}>
                        <img
                          src={product.product.image_url}
                          alt={product.product.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromWishlist(product)}
                        className="absolute top-2 right-2 bg-white/90 text-pink-600 hover:bg-white hover:text-pink-700 shadow-md"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {product.product.category}
                        </span>
                      </div>
                      <Link to={`/product/${product.product.id}`}>
                        <h3 className="font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {product.product.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => {
                            const reviews = product.product.reviews || [];
                            const avgRating = reviews.length > 0 
                              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                              : 0;
                            return (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            );
                          })}
                        </div>
                        <span className="text-xs text-gray-500">({(product.product.reviews || []).length})</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-2xl font-bold text-blue-600">${product.product.price}</p>
                        <p className="text-xs text-gray-500">by {product.product.user.name}</p>
                      </div>

                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.product.stock_quantity === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        size="sm"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        {product.product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
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

export default Wishlist;