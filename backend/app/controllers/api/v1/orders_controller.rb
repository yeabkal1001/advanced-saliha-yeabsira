class Api::V1::OrdersController < ApplicationController
  # Public endpoints for viewing orders (requires authentication)
  # Private endpoints for creating/updating orders (requires authentication)

  def index
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @orders = @current_user.orders.includes(:order_items, :products)
    render json: @orders.as_json(
      include: { 
        order_items: { 
          include: { 
            product: { 
              only: [:id, :title, :price, :image_url],
              methods: [:image_url]
            } 
          } 
        } 
      }
    )
  end

  def show
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @order = @current_user.orders.includes(:order_items, :products).find(params[:id])
    render json: @order.as_json(
      include: { 
        order_items: { 
          include: { 
            product: { 
              only: [:id, :title, :price, :image_url, :category],
              methods: [:image_url]
            } 
          } 
        } 
      }
    )
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Order not found' }, status: :not_found
  end

  def create
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    # Calculate total amount from order items
    total_amount = 0
    order_items_data = params[:order][:order_items] || []
    
    order_items_data.each do |item_data|
      product = Product.find(item_data[:product_id])
      quantity = item_data[:quantity].to_i
      price = product.price
      total_amount += price * quantity
    end

    @order = @current_user.orders.build(
      status: 'pending',
      total_amount: total_amount,
      shipping_address: params[:order][:shipping_address],
      billing_address: params[:order][:billing_address] || params[:order][:shipping_address]
    )
    
    if @order.save
      # Create order items
      order_items_data.each do |item_data|
        product = Product.find(item_data[:product_id])
        quantity = item_data[:quantity].to_i
        price = product.price
        
        @order.order_items.create!(
          product: product,
          quantity: quantity,
          price: price
        )

        # Update product stock
        product.update!(stock_quantity: product.stock_quantity - quantity)
      end

      render json: @order.as_json(
        include: { 
          order_items: { 
            include: { 
              product: { 
                only: [:id, :title, :price, :image_url],
                methods: [:image_url]
              } 
            } 
          } 
        }
      ), status: :created
    else
      render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: 'Product not found' }, status: :not_found
  end

  def update
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @order = @current_user.orders.find(params[:id])
    
    if @order.update(order_params)
      render json: @order.as_json(
        include: { 
          order_items: { 
            include: { 
              product: { 
                only: [:id, :title, :price, :image_url],
                methods: [:image_url]
              } 
            } 
          } 
        }
      )
    else
      render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Order not found' }, status: :not_found
  end

  def destroy
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    @order = @current_user.orders.find(params[:id])
    
    # Restore product stock if order is cancelled
    if @order.status == 'pending'
      @order.order_items.each do |item|
        item.product.update!(stock_quantity: item.product.stock_quantity + item.quantity)
      end
    end
    
    @order.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Order not found' }, status: :not_found
  end

  # Get orders for a specific seller (products they've sold)
  def seller_orders
    authenticate_user
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
      return
    end

    # Find orders that contain products sold by the current user
    seller_product_ids = @current_user.products.pluck(:id)
    @orders = Order.includes(:order_items, :user)
                   .where(order_items: { product_id: seller_product_ids })
                   .distinct

    render json: @orders.as_json(
      include: { 
        user: { only: [:id, :name, :email] },
        order_items: { 
          include: { 
            product: { 
              only: [:id, :title, :price, :image_url],
              methods: [:image_url]
            } 
          } 
        } 
      }
    )
  end

  private

  def order_params
    params.require(:order).permit(:status, :shipping_address, :billing_address, :total_amount, :notes, :tracking_number, :estimated_delivery)
  end
end 