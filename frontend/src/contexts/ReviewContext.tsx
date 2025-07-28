import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { reviewsAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
  };
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface ProductRating {
  product_id: number;
  average_rating: number;
  total_reviews: number;
  rating_breakdown: {
    [key: number]: number;
  };
}

interface ReviewContextType {
  reviews: Review[];
  userReviews: Review[];
  loading: boolean;
  error: string | null;
  getProductReviews: (productId: number) => Promise<Review[]>;
  getUserReviews: () => Promise<Review[]>;
  addReview: (productId: number, reviewData: { rating: number; comment: string }) => Promise<void>;
  updateReview: (reviewId: number, reviewData: { rating: number; comment: string }) => Promise<void>;
  deleteReview: (reviewId: number) => Promise<void>;
  getProductRating: (productId: number) => Promise<ProductRating>;
  canUserReview: (productId: number) => Promise<boolean>;
  refreshReviews: () => void;
}

const ReviewContext = createContext<ReviewContextType | null>(null);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user reviews from API
  const fetchUserReviews = useCallback(async () => {
    if (!user) {
      setUserReviews([]);
      return;
    }

    try {
      const response = await reviewsAPI.getUserReviews();
      setUserReviews(response.data);
    } catch (err) {
      console.error('Failed to fetch user reviews:', err);
      setUserReviews([]);
    }
  }, [user]);

  // Load user reviews when user changes
  useEffect(() => {
    fetchUserReviews();
  }, [user, fetchUserReviews]);

  const refreshReviews = () => {
    fetchUserReviews();
  };

  const getProductReviews = async (productId: number): Promise<Review[]> => {
    try {
      const response = await reviewsAPI.getByProduct(productId);
      return response.data.sort((a: Review, b: Review) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (err) {
      console.error('Failed to fetch product reviews:', err);
      return [];
    }
  };

  const getUserReviews = async (): Promise<Review[]> => {
    if (!user) return [];
    
    try {
      const response = await reviewsAPI.getUserReviews();
      return response.data.sort((a: Review, b: Review) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (err) {
      console.error('Failed to fetch user reviews:', err);
      return [];
    }
  };

  const addReview = async (productId: number, reviewData: { rating: number; comment: string }) => {
    try {
      const response = await reviewsAPI.create(productId, reviewData);
      const newReview = response.data;
      
      // Add to user reviews
      setUserReviews(prev => [newReview, ...prev]);
      
      // Update local reviews if this product's reviews are loaded
      setReviews(prev => [newReview, ...prev]);
    } catch (err) {
      console.error('Failed to add review:', err);
      setError('Failed to add review. Please try again.');
      throw err;
    }
  };

  const updateReview = async (reviewId: number, reviewData: { rating: number; comment: string }) => {
    try {
      const response = await reviewsAPI.update(reviewId, reviewData);
      const updatedReview = response.data;
      
      // Update in user reviews
      setUserReviews(prev =>
        prev.map(review =>
          review.id === reviewId ? updatedReview : review
        )
      );
      
      // Update in local reviews
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId ? updatedReview : review
        )
      );
    } catch (err) {
      console.error('Failed to update review:', err);
      setError('Failed to update review. Please try again.');
      throw err;
    }
  };

  const deleteReview = async (reviewId: number) => {
    try {
      await reviewsAPI.delete(reviewId);
      
      // Remove from user reviews
      setUserReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // Remove from local reviews
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError('Failed to delete review. Please try again.');
      throw err;
    }
  };

  const getProductRating = async (productId: number): Promise<ProductRating> => {
    try {
      const response = await reviewsAPI.getProductRating(productId);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch product rating:', err);
      return {
        product_id: productId,
        average_rating: 0,
        total_reviews: 0,
        rating_breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  };

  const canUserReview = async (productId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get the latest user reviews from the API
      const userReviewsData = await getUserReviews();
      const userProductReviews = userReviewsData.filter(review => review.product_id === productId);
      return userProductReviews.length === 0;
    } catch (err) {
      console.error('Failed to check if user can review:', err);
      return false;
    }
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      userReviews,
      loading,
      error,
      getProductReviews,
      getUserReviews,
      addReview,
      updateReview,
      deleteReview,
      getProductRating,
      canUserReview,
      refreshReviews
    }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within ReviewProvider');
  }
  return context;
};