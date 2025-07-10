class User < ApplicationRecord
  has_secure_password
  
  has_many :products, dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many :wishlist_items, dependent: :destroy
  
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :store_name, presence: true, length: { minimum: 3, maximum: 30 }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }
end 