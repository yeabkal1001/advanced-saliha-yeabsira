class Api::V1::ProductsController < ApplicationController
  # Products controller for managing product CRUD operations
  # Handles product listing, creation, updates, and search functionality
  # Remove problematic callbacks for now
  # skip_before_action :require_authentication, only: [:index, :show, :search]
  # before_action :require_authentication, only: [:create, :update, :destroy]

  def index
    @products = Product.includes(:user, :reviews).all
    render json: @products.as_json(
      include: { user: { only: [:id, :name] }, reviews: { only: [:rating, :comment, :created_at] } },
      methods: [:image_url]
    )
  end

  def show
    @product = Product.includes(:user, :reviews).find(params[:id])
    render json: @product.as_json(
      include: { 
        user: { only: [:id, :name] }, 
        reviews: { 
          include: { user: { only: [:id, :name] } },
          only: [:id, :rating, :comment, :created_at] 
        } 
      },
      methods: [:image_url]
    )
  end

  def create
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end
    
    @product = @current_user.products.build(product_params)
    
    if @product.save
      render json: @product.as_json(
        include: { user: { only: [:id, :name] } },
        methods: [:image_url]
      ), status: :created
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end
    
    @product = @current_user.products.find(params[:id])
    
    if @product.update(product_params)
      render json: @product.as_json(
        include: { user: { only: [:id, :name] } },
        methods: [:image_url]
      )
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end
    
    @product = @current_user.products.find(params[:id])
    @product.destroy
    head :no_content
  end

  def search
    query = params[:q]
    @products = Product.search(query).includes(:user, :reviews)
    render json: @products.as_json(
      include: { user: { only: [:id, :name] }, reviews: { only: [:rating, :comment, :created_at] } },
      methods: [:image_url]
    )
  end

  private

  def product_params
    params.require(:product).permit(:title, :description, :price, :category, :stock_quantity, :image_url)
  end
end 