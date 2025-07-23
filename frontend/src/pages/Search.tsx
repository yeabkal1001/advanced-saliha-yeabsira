import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '../contexts/ProductContext';
import { useSearch } from '../contexts/SearchContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../hooks/use-toast';
import { Search as SearchIcon, Heart, ShoppingCart, Star, Filter, SlidersHorizontal } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, addToCart } = useProducts();
  const { addToSearchHistory, popularSearches } = useSearch();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products
    .filter(product => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.user.name.toLowerCase().includes(query);
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      let matchesPrice = true;
      if (priceRange !== 'all') {
        const price = product.price;
        switch (priceRange) {
          case 'under-25':
            matchesPrice = price < 25;
            break;
          case '25-50':
            matchesPrice = price >= 25 && price <= 50;
            break;
          case '50-100':
            matchesPrice = price >= 50 && price <= 100;
            break;
          case 'over-100':
            matchesPrice = price > 100;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating': {
          const aRating = a.reviews.length > 0 ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length : 0;
          const bRating = b.reviews.length > 0 ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length : 0;
          return bRating - aRating;
        }
        case 'newest': {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        case 'relevance':
        default: {
          // Simple relevance based on title match
          if (!searchQuery.trim()) return 0;
          const aRelevance = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
          const bRelevance = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
          return bRelevance - aRelevance;
        }
      }
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      addToSearchHistory(searchQuery);
    }
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="sticky top-0 z-10 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">Search Products</h1>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            Filters
          </Button>
        </form>

        {/* Popular Searches */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Popular:</span>
            {popularSearches.slice(0, 6).map((search, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                onClick={() => {
                  setSearchQuery(search);
                  setSearchParams({ q: search });
                  addToSearchHistory(search);
                }}
              >
                {search}
              </Badge>
            ))}
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg border"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-25">Under $25</SelectItem>
                    <SelectItem value="25-50">$25 - $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="over-100">Over $100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange('all');
                    setSortBy('relevance');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        {searchQuery && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            {filteredProducts.length > 0 && (
              <p className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            )}
          </div>
        )}

        {filteredProducts.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-8 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <SearchIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try different keywords or check out these popular searches
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {popularSearches.slice(0, 4).map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    setSearchQuery(search);
                    setSearchParams({ q: search });
                    addToSearchHistory(search);
                  }}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer"
              >
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-blue-200">
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
                        className={`bg-white/90 shadow-md ${
                          isInWishlist(product.id) 
                            ? 'text-pink-600 hover:text-pink-700' 
                            : 'text-gray-600 hover:text-pink-600'
                        }`}
                      >
                        <Heart size={16} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => handleAddToCart(product, e)}
                        className="bg-white/90 text-blue-600 hover:bg-white hover:text-blue-700 shadow-md"
                      >
                        <ShoppingCart size={16} />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                          const avgRating = product.reviews.length > 0 
                            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
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
                      <span className="text-xs text-gray-500">({product.reviews.length})</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                        <p className="text-xs text-gray-500">by {product.user.name}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.stock_quantity} left
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

export default Search;