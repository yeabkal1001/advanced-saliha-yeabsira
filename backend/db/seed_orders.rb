# Create sample orders for testing the order management system

# Clear existing data
Order.destroy_all
Product.destroy_all
User.destroy_all

# Create users
buyer = User.create!(
  name: 'John Buyer',
  email: 'buyer@example.com',
  password: 'password123'
)

seller = User.create!(
  name: 'Jane Seller',
  email: 'seller@example.com',
  password: 'password123',
  store_name: 'Janes Amazing Store'
)

# Create some products for the seller
products = []
5.times do |i|
  product = Product.create!(
    title: "Sample Product #{i + 1}",
    description: "This is a sample product for testing order management",
    price: (20 + i * 10).to_f,
    category: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'][i],
    stock_quantity: 50,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    user: seller
  )
  products << product
end

# Create sample orders with different statuses
statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

5.times do |i|
  order = Order.create!(
    user: buyer,
    status: statuses[i],
    total_amount: (50 + i * 25).to_f,
    shipping_address: "#{123 + i} Main St, City #{i + 1}, State 12345",
    billing_address: "#{123 + i} Main St, City #{i + 1}, State 12345",
    notes: i.even? ? "Please handle with care" : nil,
    seller_notes: i.odd? ? "Customer requested express shipping" : nil,
    tracking_number: i >= 2 ? "TRK#{Time.current.strftime('%Y%m%d')}#{1000 + i}" : nil,
    estimated_delivery: i >= 2 ? (Date.current + (3 - i).days) : nil
  )

  # Add 1-3 items to each order
  (1..rand(1..3)).each do |j|
    product = products.sample
    OrderItem.create!(
      order: order,
      product: product,
      quantity: rand(1..3),
      price: product.price
    )
  end

  # Update the order total based on items
  order.update_total
end

puts "Created #{Order.count} orders with #{OrderItem.count} order items"
puts "Seller: #{seller.email} (#{seller.name})"
puts "Buyer: #{buyer.email} (#{buyer.name})"
puts "Products: #{products.count}"