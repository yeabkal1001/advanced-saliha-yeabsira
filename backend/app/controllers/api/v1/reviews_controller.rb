class Api::V1::ReviewsController < ApplicationController
  # Public endpoint for viewing reviews (no authentication required)
  # Private endpoints for creating/updating reviews (requires authentication)

  def index
    @reviews = Review.includes(:user).where(product_id: params[:product_id])
    render json: @reviews.as_json(
      include: { 
        user: { 
          only: [:id, :name] 
        } 
      },
      only: [:id, :rating, :comment, :created_at]
    )
  end

  def create
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @product = Product.find(params[:product_id])
    
    # Check if user has already reviewed this product
    existing_review = @product.reviews.find_by(user: @current_user)
    if existing_review
      render json: { error: 'You have already reviewed this product' }, status: :unprocessable_entity
      return
    end

    # Check if user has purchased this product (optional validation)
    # has_purchased = @current_user.orders.joins(:order_items)
    #                           .where(order_items: { product: @product })
    #                           .where.not(status: 'cancelled')
    #                           .exists?
    
    # unless has_purchased
    #   render json: { error: 'You can only review products you have purchased' }, status: :forbidden
    #   return
    # end

    @review = @product.reviews.build(review_params)
    @review.user = @current_user
    
    if @review.save
      render json: @review.as_json(
        include: { 
          user: { 
            only: [:id, :name] 
          } 
        },
        only: [:id, :rating, :comment, :created_at]
      ), status: :created
    else
      render json: { errors: @review.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Product not found' }, status: :not_found
  end

  def update
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @review = @current_user.reviews.find(params[:id])
    
    if @review.update(review_params)
      render json: @review.as_json(
        include: { 
          user: { 
            only: [:id, :name] 
          } 
        },
        only: [:id, :rating, :comment, :created_at, :updated_at]
      )
    else
      render json: { errors: @review.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Review not found' }, status: :not_found
  end

  def destroy
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @review = @current_user.reviews.find(params[:id])
    @review.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Review not found' }, status: :not_found
  end

  # Get reviews by a specific user
  def user_reviews
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @reviews = @current_user.reviews.includes(:product)
    render json: @reviews.as_json(
      include: { 
        product: { 
          only: [:id, :title, :image_url],
          methods: [:image_url]
        } 
      },
      only: [:id, :rating, :comment, :created_at]
    )
  end

  # Get average rating for a product
  def product_rating
    @product = Product.find(params[:product_id])
    average_rating = @product.reviews.average(:rating)&.round(1) || 0
    total_reviews = @product.reviews.count
    
    render json: {
      product_id: @product.id,
      average_rating: average_rating,
      total_reviews: total_reviews,
      rating_breakdown: rating_breakdown(@product)
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Product not found' }, status: :not_found
  end

  private

  def review_params
    params.require(:review).permit(:rating, :comment)
  end

  def rating_breakdown(product)
    breakdown = {}
    (1..5).each do |rating|
      count = product.reviews.where(rating: rating).count
      breakdown[rating] = count
    end
    breakdown
  end
end 