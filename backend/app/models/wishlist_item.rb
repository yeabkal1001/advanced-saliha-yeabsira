class WishlistItem < ApplicationRecord
  belongs_to :user
  belongs_to :product
  
  validates :user_id, uniqueness: { scope: :product_id, message: "Product is already in your wishlist" }
end 