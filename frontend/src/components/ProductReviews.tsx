import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useReviews, Review, ProductRating } from '../contexts/ReviewContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Star, ThumbsUp, Verified, MessageSquare } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { getProductReviews, addReview, canUserReview, getProductRating } = useReviews();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productRating, setProductRating] = useState<ProductRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  // Load reviews and rating data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reviewsData, ratingData] = await Promise.all([
          getProductReviews(parseInt(productId)),
          getProductRating(parseInt(productId))
        ]);
        setReviews(reviewsData);
        setProductRating(ratingData);
        
        // Check if user can review this product
        if (user) {
          const canReviewProduct = await canUserReview(parseInt(productId));
          setCanReview(canReviewProduct);
        }
      } catch (error) {
        console.error('Failed to load review data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, getProductReviews, getProductRating, canUserReview, user]);

  const handleSubmitReview = async () => {
    if (!user) return;
    
    if (!reviewForm.comment.trim()) {
      toast({
        title: "Review incomplete",
        description: "Please provide a comment for your review (minimum 10 characters).",
        variant: "destructive"
      });
      return;
    }

    if (reviewForm.comment.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please provide a comment with at least 10 characters.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addReview(parseInt(productId), {
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. Your review has been posted.",
      });

      setIsReviewDialogOpen(false);
      setReviewForm({ rating: 5, comment: '' });
      
      // Reload data
      const [reviewsData, ratingData] = await Promise.all([
        getProductReviews(parseInt(productId)),
        getProductRating(parseInt(productId))
      ]);
      setReviews(reviewsData);
      setProductRating(ratingData);
      setCanReview(false); // User can no longer review this product
    } catch (error: any) {
      console.error('Review submission error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.errors?.join(', ') ||
                          'Failed to submit your review. Please try again.';
      
      toast({
        title: "Review failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
                          <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {productRating?.average_rating > 0 ? productRating.average_rating.toFixed(1) : 'No ratings'}
                </div>
                {productRating?.average_rating > 0 && (
                  <>
                    {renderStars(productRating.average_rating, 'lg')}
                    <p className="text-gray-600 mt-2">{productRating.total_reviews} review{productRating.total_reviews !== 1 ? 's' : ''}</p>
                  </>
                )}
              </div>

              {/* Rating Distribution */}
              {productRating?.total_reviews > 0 && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${productRating.total_reviews > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / productRating.total_reviews) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm w-8 text-gray-600">
                      {ratingDistribution[rating as keyof typeof ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

                      {/* Write Review Button */}
            {user && canReview && (
            <div className="mt-6 text-center">
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write Your Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                            className="p-1"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                rating <= reviewForm.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-400'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reviewTitle">Review Title</Label>
                      <Input
                        id="reviewTitle"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Summarize your experience"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reviewComment">Your Review</Label>
                      <Textarea
                        id="reviewComment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Tell others about your experience with this product"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitReview} className="flex-1">
                        Submit Review
                      </Button>
                      <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <p>Loading reviews...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {review.user.name.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{review.user.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">Be the first to review this product!</p>
            {user && canReview && (
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Write the First Review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write Your Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                            className="p-1"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                rating <= reviewForm.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-400'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reviewTitle">Review Title</Label>
                      <Input
                        id="reviewTitle"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Summarize your experience"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reviewComment">Your Review</Label>
                      <Textarea
                        id="reviewComment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Tell others about your experience with this product"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitReview} className="flex-1">
                        Submit Review
                      </Button>
                      <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};