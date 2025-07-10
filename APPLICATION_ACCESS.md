# 🚀 E-commerce Full-Stack Application - Access Guide

## 🌐 **Application URLs**

### **Frontend Application**
- **URL**: http://localhost:3001
- **Status**: ✅ Running and Accessible
- **Technology**: React 18 + TypeScript + Vite + Tailwind CSS

### **Backend API**
- **URL**: http://localhost:3000
- **Status**: ✅ Running and Accessible
- **Technology**: Ruby on Rails 7.1 API

### **Database**
- **Host**: localhost
- **Port**: 3307
- **Status**: ✅ Running and Accessible
- **Technology**: MySQL 8.0

## 🔐 **Database Credentials**

### **MySQL Database**
```
Host: localhost
Port: 3307
Database: rails_app_development
Username: rails_user
Password: rails_password
Root Password: rootpassword
```

### **Database Connection String**
```
mysql://rails_user:rails_password@localhost:3307/rails_app_development
```

## 🛠️ **API Endpoints**

### **Public Endpoints (No Authentication Required)**
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product details
- `GET /api/v1/products/search?q=query` - Search products
- `GET /api/v1/products/:id/reviews` - Get product reviews

### **Authentication Endpoints**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `DELETE /api/v1/auth/signout` - User logout
- `GET /api/v1/auth/me` - Get current user

### **Protected Endpoints (Require Authentication)**
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/orders` - List user orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/wishlist` - Get user wishlist
- `POST /api/v1/wishlist` - Add to wishlist

## 🗄️ **Database Schema**

### **Tables Created**
1. **users** - User accounts and authentication
2. **products** - Product catalog
3. **orders** - Order management
4. **order_items** - Order line items
5. **reviews** - Product reviews
6. **wishlist_items** - User wishlists
7. **posts** - Legacy blog posts (for compatibility)

### **Sample Database Queries**
```sql
-- Connect to database
mysql -h localhost -P 3307 -u rails_user -p rails_app_development

-- View all tables
SHOW TABLES;

-- View users
SELECT * FROM users;

-- View products
SELECT * FROM products;

-- View orders
SELECT * FROM orders;
```

## 🧪 **Testing the Application**

### **Test Script**
Run the built-in test script:
```bash
./test-app.sh
```

### **Manual Testing**

#### **1. Test Frontend**
```bash
curl -s http://localhost:3001 | head -c 200
```

#### **2. Test Backend API**
```bash
# Test products endpoint
curl -s http://localhost:3000/api/v1/products

# Test posts endpoint
curl -s http://localhost:3000/api/v1/posts
```

#### **3. Test Database Connection**
```bash
docker-compose exec db mysql -u rails_user -prails_password -e "SELECT 1;"
```

## 🐳 **Docker Commands**

### **Container Management**
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# Stop application
docker-compose down

# Start application
docker-compose up -d

# Rebuild and start
docker-compose up --build -d
```

### **Service Names**
- `backend` - Rails API
- `frontend` - React application
- `db` - MySQL database

## 📊 **Application Status**

### **Current Status**
- ✅ **Database**: Running and accessible
- ✅ **Backend API**: Running and responding
- ✅ **Frontend**: Running and accessible
- ✅ **Docker Containers**: All running
- ✅ **Database Migrations**: Applied successfully

### **Container Details**
```
Backend:   http://localhost:3000 (Rails API)
Frontend:  http://localhost:3001 (React App)
Database:  localhost:3307 (MySQL)
```

## 🔧 **Development Commands**

### **Backend (Rails)**
```bash
# Access Rails console
docker-compose exec backend bundle exec rails console

# Run migrations
docker-compose exec backend bundle exec rails db:migrate

# Create database
docker-compose exec backend bundle exec rails db:create

# Reset database
docker-compose exec backend bundle exec rails db:reset
```

### **Frontend (React)**
```bash
# Access frontend container
docker-compose exec frontend sh

# Install dependencies (if needed)
docker-compose exec frontend npm install
```

### **Database (MySQL)**
```bash
# Access MySQL console
docker-compose exec db mysql -u rails_user -p rails_app_development

# Backup database
docker-compose exec db mysqldump -u rails_user -p rails_app_development > backup.sql

# Restore database
docker-compose exec -T db mysql -u rails_user -p rails_app_development < backup.sql
```

## 🎯 **Next Steps**

1. **Access the Frontend**: Open http://localhost:3001 in your browser
2. **Create a User Account**: Use the signup endpoint or frontend
3. **Add Products**: Use the products API or frontend interface
4. **Test E-commerce Features**: Orders, reviews, wishlist

## 🚨 **Troubleshooting**

### **If Backend is Not Responding**
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### **If Database Connection Fails**
```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### **If Frontend is Not Accessible**
```bash
# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend
```

---

## 🎉 **Your E-commerce Application is Ready!**

**Frontend**: http://localhost:3001
**Backend API**: http://localhost:3000
**Database**: localhost:3307

All services are running and ready for development! 🚀 