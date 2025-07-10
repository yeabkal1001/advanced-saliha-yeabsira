class Product < ApplicationRecord
  belongs_to :user
  has_many :reviews, dependent: :destroy
  has_many :wishlist_items, dependent: :destroy
  has_many :order_items, dependent: :destroy
  has_one_attached :image

  validates :title, presence: true
  validates :description, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :category, presence: true
  validates :stock_quantity, presence: true, numericality: { greater_than_or_equal_to: 0 }
  # validates :image, presence: true  # Made optional for now

  scope :search, ->(query) { where("title ILIKE ? OR description ILIKE ?", "%#{query}%", "%#{query}%") }

  def average_rating
    reviews.average(:rating)&.round(1) || 0
  end

  def review_count
    reviews.count
  end

  def image_url
    if image.attached?
      Rails.application.routes.url_helpers.rails_blob_url(image, only_path: false)
    elsif self[:image_url].present?
      self[:image_url]
    else
      nil
    end
  end
end 