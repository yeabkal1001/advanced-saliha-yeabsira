class Review < ApplicationRecord
  belongs_to :user
  belongs_to :product
  
  validates :rating, presence: true, numericality: { in: 1..5 }
  validates :comment, presence: true, length: { minimum: 10 }
  validates :user_id, uniqueness: { scope: :product_id, message: "You have already reviewed this product" }
  
  after_save :update_product_rating
  after_destroy :update_product_rating
  
  private
  
  def update_product_rating
    product.touch # This will update the updated_at timestamp
  end
end 