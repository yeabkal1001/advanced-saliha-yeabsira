class Api::V1::WishlistController < ApplicationController
  # All wishlist endpoints require authentication

  def index
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @wishlist_items = @current_user.wishlist_items.includes(:product)
    render json: @wishlist_items.as_json(
      include: { 
        product: { 
          include: { 
            user: { 
              only: [:id, :name] 
            },
            reviews: {
              only: [:rating, :comment, :created_at]
            }
          },
          only: [:id, :title, :price, :category, :image_url, :stock_quantity],
          methods: [:image_url]
        } 
      },
      only: [:id, :created_at]
    )
  end

  def create
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    product_id = params[:product_id] || params.dig(:wishlist, :product_id)
    @product = Product.find(product_id)
    
    # Check if item is already in wishlist
    existing_item = @current_user.wishlist_items.find_by(product: @product)
    if existing_item
      render json: { error: 'Product is already in your wishlist' }, status: :unprocessable_entity
      return
    end

    @wishlist_item = @current_user.wishlist_items.build(product: @product)
    
    if @wishlist_item.save
      render json: @wishlist_item.as_json(
        include: { 
          product: { 
            include: { 
              user: { 
                only: [:id, :name] 
              },
              reviews: {
                only: [:rating, :comment, :created_at]
              }
            },
            only: [:id, :title, :price, :category, :image_url, :stock_quantity],
            methods: [:image_url]
          } 
        },
        only: [:id, :created_at]
      ), status: :created
    else
      render json: { errors: @wishlist_item.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Product not found' }, status: :not_found
  end

  def destroy
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @wishlist_item = @current_user.wishlist_items.find_by(product_id: params[:id])
    
    if @wishlist_item
      @wishlist_item.destroy
      head :no_content
    else
      render json: { error: 'Wishlist item not found' }, status: :not_found
    end
  end

  # Check if a product is in user's wishlist
  def check
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    product_id = params[:product_id]
    is_in_wishlist = @current_user.wishlist_items.exists?(product_id: product_id)
    
    render json: {
      product_id: product_id,
      is_in_wishlist: is_in_wishlist
    }
  end

  # Add multiple products to wishlist
  def add_multiple
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    product_ids = params[:product_ids] || []
    added_items = []
    errors = []

    product_ids.each do |product_id|
      begin
        product = Product.find(product_id)
        
        # Check if already in wishlist
        unless @current_user.wishlist_items.exists?(product: product)
          wishlist_item = @current_user.wishlist_items.create!(product: product)
          added_items << wishlist_item
        end
      rescue ActiveRecord::RecordNotFound
        errors << "Product with ID #{product_id} not found"
      end
    end

    if errors.empty?
      render json: {
        message: "Successfully added #{added_items.length} items to wishlist",
        added_items: added_items.as_json(
          include: { 
            product: { 
              include: { 
                user: { 
                  only: [:id, :name] 
                },
                reviews: {
                  only: [:rating, :comment, :created_at]
                }
              },
              only: [:id, :title, :price, :category, :image_url, :stock_quantity],
              methods: [:image_url]
            } 
          }
        )
      }, status: :created
    else
      render json: {
        message: "Added #{added_items.length} items, but encountered some errors",
        added_items: added_items.as_json(
          include: { 
            product: { 
              include: { 
                user: { 
                  only: [:id, :name] 
                },
                reviews: {
                  only: [:rating, :comment, :created_at]
                }
              },
              only: [:id, :title, :price, :category, :image_url, :stock_quantity],
              methods: [:image_url]
            } 
          }
        ),
        errors: errors
      }, status: :partial_content
    end
  end

  # Clear entire wishlist
  def clear
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    count = @current_user.wishlist_items.count
    @current_user.wishlist_items.destroy_all
    
    render json: {
      message: "Cleared #{count} items from wishlist"
    }
  end
end 