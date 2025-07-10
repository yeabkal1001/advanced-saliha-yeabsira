class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items
  
  validates :status, presence: true, inclusion: { in: %w[pending paid shipped delivered cancelled] }
  validates :total_amount, presence: true, numericality: { greater_than: 0 }
  
  accepts_nested_attributes_for :order_items
  
  enum status: {
    pending: 'pending',
    paid: 'paid',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled'
  }
  
  def update_total
    self.total_amount = order_items.sum(&:subtotal)
    save
  end
end 