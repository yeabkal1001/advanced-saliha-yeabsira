# Database seeding file for development and testing
# Creates sample users, products, and orders for the application
# Clear existing data
puts "Clearing existing data..."
User.destroy_all
Product.destroy_all
Order.destroy_all
Review.destroy_all
WishlistItem.destroy_all

# Create admin user
puts "Creating admin user..."
admin = User.create!(
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  password_confirmation: "admin123",
  store_name: "Admin Store"
)

# Create sample users
puts "Creating sample users..."
users = [
  User.create!(
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    password_confirmation: "password123",
    store_name: "John's Store"
  ),
  User.create!(
    name: "Sarah Johnson",
    email: "sarah@example.com",
    password: "password123",
    password_confirmation: "password123",
    store_name: "Sarah's Store"
  ),
  User.create!(
    name: "Mike Chen",
    email: "mike@example.com",
    password: "password123",
    password_confirmation: "password123",
    store_name: "Mike's Store"
  ),
  User.create!(
    name: "Emma Wilson",
    email: "emma@example.com",
    password: "password123",
    password_confirmation: "password123",
    store_name: "Emma's Store"
  )
]

# Create sample products
puts "Creating sample products..."
products = [
  Product.create!(
    title: "Wireless Bluetooth Headphones",
    description: "Premium quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals who need crystal clear audio.",
    price: 199.99,
    category: "Electronics",
    stock_quantity: 15,
    user: admin,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  ),
  Product.create!(
    title: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt available in multiple colors. Made from 100% organic cotton, perfect for everyday wear.",
    price: 29.99,
    category: "Clothing",
    stock_quantity: 50,
    user: users[0],
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
  ),
  Product.create!(
    title: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitor, GPS, and smartphone integration. Track your workouts, sleep, and daily activity with precision.",
    price: 299.99,
    category: "Electronics",
    stock_quantity: 8,
    user: users[1],
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
  ),
  Product.create!(
    title: "Artisan Coffee Beans",
    description: "Premium single-origin coffee beans, freshly roasted with rich flavor notes. Perfect for coffee enthusiasts who appreciate quality and taste.",
    price: 24.99,
    category: "Food & Beverages",
    stock_quantity: 100,
    user: users[2],
    image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"
  ),
  Product.create!(
    title: "Leather Laptop Bag",
    description: "Handcrafted genuine leather laptop bag with multiple compartments and adjustable strap. Perfect for professionals who need style and functionality.",
    price: 149.99,
    category: "Accessories",
    stock_quantity: 12,
    user: users[3],
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
  ),
  Product.create!(
    title: "Indoor Plant Collection",
    description: "Set of 3 low-maintenance indoor plants perfect for home or office decoration. Includes care instructions and decorative pots.",
    price: 79.99,
    category: "Home & Garden",
    stock_quantity: 25,
    user: admin,
    image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
  )
]

# Create sample reviews
puts "Creating sample reviews..."
reviews = [
  Review.create!(
    rating: 5,
    comment: "These headphones exceeded my expectations. The noise cancellation is fantastic and the battery life is exactly as advertised. Highly recommend!",
    user: users[0],
    product: products[0]
  ),
  Review.create!(
    rating: 4,
    comment: "Good headphones overall. The build quality is solid and they're comfortable for long listening sessions. Only minor complaint is the case could be more compact.",
    user: users[1],
    product: products[0]
  ),
  Review.create!(
    rating: 5,
    comment: "Love this organic cotton t-shirt! It's so soft and comfortable. The fit is perfect and it hasn't shrunk after multiple washes. Will definitely buy more colors.",
    user: users[2],
    product: products[1]
  ),
  Review.create!(
    rating: 4,
    comment: "Great fitness watch with accurate tracking. The GPS works well and the battery lasts a long time. App integration is seamless.",
    user: users[3],
    product: products[2]
  ),
  Review.create!(
    rating: 5,
    comment: "Amazing coffee! The flavor is rich and complex. Perfect for my morning routine. Will definitely order again.",
    user: admin,
    product: products[3]
  )
]

# Create sample orders
puts "Creating sample orders..."
orders = [
  Order.create!(
    user: users[0],
    status: "paid",
    total_amount: 199.99,
    shipping_address: "123 Main St, City, State 12345",
    billing_address: "123 Main St, City, State 12345"
  ),
  Order.create!(
    user: users[1],
    status: "pending",
    total_amount: 59.98,
    shipping_address: "456 Oak Ave, Town, State 67890",
    billing_address: "456 Oak Ave, Town, State 67890"
  )
]

# Create order items
puts "Creating order items..."
OrderItem.create!(
  order: orders[0],
  product: products[0],
  quantity: 1,
  price: 199.99
)

OrderItem.create!(
  order: orders[1],
  product: products[1],
  quantity: 2,
  price: 29.99
)

puts "Database seeded successfully!"
puts "Created:"
puts "- #{User.count} users"
puts "- #{Product.count} products"
puts "- #{Review.count} reviews"
puts "- #{Order.count} orders"
puts "- #{OrderItem.count} order items"
puts ""
puts "Admin user: admin@example.com (password: admin123)"
puts "Sample users: john.doe@example.com, sarah@example.com, mike@example.com, emma@example.com (password: password123)" 