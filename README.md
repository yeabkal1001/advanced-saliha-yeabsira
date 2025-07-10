# 🚀 Rails + React Full-Stack Application

A modern full-stack web application built with Ruby on Rails API backend and React frontend, containerized with Docker and MySQL database.

## 🏗️ Architecture

- **Backend**: Ruby on Rails 7.0 API with JWT authentication
- **Frontend**: React 18 + TypeScript + Vite with Tailwind CSS
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **API**: RESTful JSON API with CORS support
- **Features**: E-commerce platform with products, orders, reviews, and wishlists

## 📁 Project Structure

```
yeab-saliha/
├── backend/                 # Rails API application
│   ├── app/
│   │   ├── controllers/     # API controllers
│   │   └── models/         # ActiveRecord models
│   ├── config/             # Rails configuration
│   ├── db/                 # Database migrations
│   ├── Dockerfile          # Backend container
│   └── Gemfile             # Ruby dependencies
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/                # React components
│   ├── Dockerfile          # Frontend container
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Multi-container orchestration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. **Clone and navigate to the project:**
   ```bash
   cd yeab-saliha
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the applications:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Database: localhost:3306

### First Time Setup

The application will automatically:
- Create the MySQL database
- Run Rails migrations
- Install all dependencies
- Start both frontend and backend services

## 🛠️ Development

### Backend (Rails API)

The Rails backend provides a comprehensive RESTful API for an e-commerce platform:

**Authentication:**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `DELETE /api/v1/auth/signout` - User logout
- `GET /api/v1/auth/me` - Get current user

**Products:**
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/search?q=query` - Search products

**Orders:**
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/:id` - Get order details
- `POST /api/v1/orders` - Create new order
- `PUT /api/v1/orders/:id` - Update order
- `DELETE /api/v1/orders/:id` - Cancel order

**Reviews:**
- `GET /api/v1/products/:id/reviews` - Get product reviews
- `POST /api/v1/products/:id/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

**Wishlist:**
- `GET /api/v1/wishlist` - Get user wishlist
- `POST /api/v1/wishlist` - Add to wishlist
- `DELETE /api/v1/wishlist/:id` - Remove from wishlist

**Features:**
- JWT-based authentication
- MySQL database integration
- CORS enabled for frontend communication
- JSON API responses
- RESTful routing
- Comprehensive e-commerce functionality

### Frontend (React)

The React frontend provides a modern, responsive UI for a full e-commerce platform.

**Features:**
- User authentication and authorization
- Product browsing and search
- Shopping cart functionality
- Order management
- Product reviews and ratings
- Wishlist management
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Vite for fast development
- Modern UI components with Radix UI
- Real-time form validation
- Axios for API communication

## 🐳 Docker Services

### Database (MySQL)
- **Port**: 3306
- **Database**: rails_app_development
- **Username**: rails_user
- **Password**: rails_password

### Backend (Rails)
- **Port**: 3000
- **Environment**: Development
- **Auto-reload**: Enabled

### Frontend (React)
- **Port**: 3001
- **Environment**: Development
- **Hot reload**: Enabled

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

**Backend:**
- `DATABASE_URL`: MySQL connection string
- `RAILS_ENV`: Rails environment (development/production)

**Frontend:**
- `REACT_APP_API_URL`: Backend API URL

### Database Configuration

Database settings are configured in `backend/config/database.yml` and can be customized for different environments.

## 📝 API Documentation

### Post Model

```json
{
  "id": 1,
  "title": "Post Title",
  "content": "Post content...",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### API Endpoints

#### Create Post
```bash
POST /api/v1/posts
Content-Type: application/json

{
  "post": {
    "title": "My Post",
    "content": "Post content here"
  }
}
```

#### Get All Posts
```bash
GET /api/v1/posts
```

#### Get Single Post
```bash
GET /api/v1/posts/:id
```

#### Update Post
```bash
PUT /api/v1/posts/:id
Content-Type: application/json

{
  "post": {
    "title": "Updated Title",
    "content": "Updated content"
  }
}
```

#### Delete Post
```bash
DELETE /api/v1/posts/:id
```

## 🚀 Deployment

### Production Setup

1. **Update environment variables for production**
2. **Build production images:**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

### Scaling

The application can be scaled horizontally by running multiple instances of the frontend and backend services.

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, and 3306 are available
2. **Database connection**: Wait for MySQL to fully start before accessing the API
3. **CORS issues**: Check that the frontend is making requests to the correct backend URL

### Logs

View logs for specific services:
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs db
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 What's Next?

This is a foundation for building more complex applications. You can extend it by:

- Adding user authentication
- Implementing real-time features with Action Cable
- Adding file uploads with Active Storage
- Creating more complex data models
- Adding testing with RSpec and Jest
- Implementing CI/CD pipelines

---

**Happy coding! 🚀** 