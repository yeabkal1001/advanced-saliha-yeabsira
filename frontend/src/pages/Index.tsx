import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useProducts, Product } from '../contexts/ProductContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import OrderDashboard from '../components/OrderDashboard';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Heart, 
  ShoppingCart, 
  ArrowRight,
  Zap,
  Shield,
  Truck,
  RotateCcw,
  Users,
  Award,
  Clock,
  Loader2
} from 'lucide-react';

const Index = () => {
  const { products, loading, error, addToCart } = useProducts();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { popularSearches, addToSearchHistory } = useSearch();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Featured products (highest rated)
  const featuredProducts = products
    .sort((a, b) => {
      const aRating = a.reviews.length > 0 ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length : 0;
      const bRating = b.reviews.length > 0 ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length : 0;
      return bRating - aRating;
    })
    .slice(0, 8);

  // New arrivals (most recent)
  const newArrivals = products
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  // Best sellers (most reviews)
  const bestSellers = products
    .sort((a, b) => b.reviews.length - a.reviews.length)
    .slice(0, 6);

  // Categories with counts
  const categories = Array.from(new Set(products.map(p => p.category)))
    .map(category => ({
      name: category,
      count: products.filter(p => p.category === category).length,
      image: products.find(p => p.category === category)?.image_url
    }));

  const banners = [
    {
      title: "Summer Sale - Up to 70% Off!",
      subtitle: "Don't miss out on amazing deals",
      image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200",
      cta: "Shop Now"
    },
    {
      title: "New Electronics Collection",
      subtitle: "Latest tech at unbeatable prices",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200",
      cta: "Explore"
    },
    {
      title: "Free Shipping on Orders $50+",
      subtitle: "Fast delivery to your doorstep",
      image: "https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?w=1200",
      cta: "Learn More"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product.id);
    toast({
      title: "Added to wishlist!",
      description: `${product.title} has been added to your wishlist.`,
    });
  };

  const getAverageRating = (reviews: Product['reviews']) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <Button onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2" size={16} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Search
            </Button>
          </form>
        </div>
        <div className="text-sm text-gray-600">
          Welcome back, <span className="font-medium text-blue-600">{user?.name}</span>!
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {/* Hero Banner */}
        <section className="relative h-96 overflow-hidden">
          <motion.div
            key={currentBannerIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={banners[currentBannerIndex].image}
              alt={banners[currentBannerIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center text-center text-white">
              <div className="max-w-2xl px-6">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold mb-4"
                >
                  {banners[currentBannerIndex].title}
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl mb-8"
                >
                  {banners[currentBannerIndex].subtitle}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
                    <Link to="/products">
                      {banners[currentBannerIndex].cta}
                      <ArrowRight className="ml-2" size={20} />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* Banner indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                <p className="text-gray-600">Handpicked products for you</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/products?sort=featured">
                  View All <TrendingUp className="ml-2" size={16} />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/product/${product.id}`}>
                    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleWishlistToggle(product, e)}
                            className="bg-white/90 shadow-md text-gray-600 hover:text-pink-600"
                          >
                            <Heart size={16} />
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => handleAddToCart(product, e)}
                            className="bg-white/90 text-blue-600 hover:bg-white hover:text-blue-700 shadow-md"
                          >
                            <ShoppingCart size={16} />
                          </Button>
                        </div>
                        <Badge className="absolute top-2 left-2 bg-yellow-500">
                          <Award size={12} className="mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(getAverageRating(product.reviews)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({product.reviews.length})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                            <p className="text-xs text-gray-500">by {product.user.name}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">New Arrivals</h2>
                <p className="text-gray-600">Fresh products just added</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/products?sort=newest">
                  View All <Clock className="ml-2" size={16} />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newArrivals.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/product/${product.id}`}>
                    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <Badge className="absolute top-2 left-2 bg-green-500">
                          <Clock size={12} className="mr-1" />
                          New
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(getAverageRating(product.reviews)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({product.reviews.length})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                            <p className="text-xs text-gray-500">by {product.user.name}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
              <p className="text-gray-600">Find what you're looking for</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
                    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      </div>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.count} products</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Why Choose ShopEase?</h2>
              <p className="text-gray-600">We make shopping and selling easy</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm text-gray-600">Quick and reliable shipping</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-green-600" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600">Safe and encrypted transactions</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="text-purple-600" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Free Returns</h3>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-orange-600" size={24} />
                </div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-gray-600">Always here to help</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;