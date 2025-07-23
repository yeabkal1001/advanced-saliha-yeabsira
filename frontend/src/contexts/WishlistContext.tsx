import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from './ProductContext';
import { wishlistAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: number;
  product: Product;
  created_at: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  checkWishlistStatus: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  addMultipleToWishlist: (productIds: string[]) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

// Type for API errors
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export { WishlistContext };

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await wishlistAPI.getAll();
      setWishlist(response.data);
    } catch (err: any) {
      console.error('Failed to fetch wishlist:', err);
      // Don't show error for 401 errors as they're handled by the interceptor
      if (err.response?.status !== 401) {
        setError('Failed to load wishlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load wishlist when user changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await wishlistAPI.add(parseInt(productId));
      const newItem = response.data;
      setWishlist(prev => [newItem, ...prev]);
      
      toast({
        title: "Added to wishlist!",
        description: `${newItem.product.title} has been added to your wishlist.`,
      });
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to add to wishlist. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await wishlistAPI.remove(parseInt(productId));
      setWishlist(prev => prev.filter(item => item.product.id !== productId));
      
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to remove from wishlist. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.product.id === productId);
  };

  const checkWishlistStatus = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await wishlistAPI.check(parseInt(productId));
      return response.data.is_in_wishlist;
    } catch (err) {
      console.error('Failed to check wishlist status:', err);
      return false;
    }
  };

  const clearWishlist = async () => {
    if (!user) return;

    try {
      await wishlistAPI.clear();
      setWishlist([]);
      
      toast({
        title: "Wishlist cleared",
        description: "All items have been removed from your wishlist.",
      });
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to clear wishlist. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const addMultipleToWishlist = async (productIds: string[]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    try {
      const numericIds = productIds.map(id => parseInt(id));
      const response = await wishlistAPI.addMultiple(numericIds);
      const addedItems = response.data.added_items;
      
      // Add new items to wishlist
      setWishlist(prev => [...addedItems, ...prev]);
      
      toast({
        title: "Items added to wishlist!",
        description: `Successfully added ${addedItems.length} items to your wishlist.`,
      });
    } catch (err) {
      console.error('Failed to add multiple items to wishlist:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to add items to wishlist. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      error,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      checkWishlistStatus,
      clearWishlist,
      addMultipleToWishlist,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};