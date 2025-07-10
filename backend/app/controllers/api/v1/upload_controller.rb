class Api::V1::UploadController < ApplicationController
  def create
    if params[:image].present?
      # Create a temporary product to attach the image
      temp_product = Product.new(user: current_user)
      temp_product.image.attach(params[:image])
      
      if temp_product.image.attached?
        render json: { 
          image_url: rails_blob_url(temp_product.image, only_path: false),
          success: true 
        }
      else
        render json: { error: 'Failed to attach image' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'No image provided' }, status: :bad_request
    end
  end

  private

  def rails_blob_url(blob, only_path: false)
    Rails.application.routes.url_helpers.rails_blob_url(blob, only_path: only_path)
  end
end 