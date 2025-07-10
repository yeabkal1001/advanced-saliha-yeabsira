Rails.application.routes.draw do
  # Active Storage routes
  Rails.application.routes.default_url_options[:host] = 'localhost:3000'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "posts#index"
  
  namespace :api do
    namespace :v1 do
      # Authentication routes
      post 'auth/signup', to: 'auth#signup'
      post 'auth/signin', to: 'auth#signin'
      delete 'auth/signout', to: 'auth#signout'
      get 'auth/me', to: 'auth#me'
      
      # Product routes
      resources :products do
        collection do
          get :search
        end
        resources :reviews, only: [:index, :create]
      end
      
      # Review routes (for update/delete)
      resources :reviews, only: [:update, :destroy] do
        collection do
          get :user_reviews
        end
      end
      
      # Product rating route
      get 'products/:product_id/rating', to: 'reviews#product_rating'
      
      # Order routes
      resources :orders do
        collection do
          get :seller_orders
        end
      end
      
      # Wishlist routes
      get 'wishlist', to: 'wishlist#index'
      post 'wishlist', to: 'wishlist#create'
      delete 'wishlist/:id', to: 'wishlist#destroy'
      get 'wishlist/check/:product_id', to: 'wishlist#check'
      post 'wishlist/add_multiple', to: 'wishlist#add_multiple'
      delete 'wishlist', to: 'wishlist#clear'
      
      # Upload route
      post 'upload', to: 'upload#create'
      
      # Legacy posts routes (keeping for compatibility)
      resources :posts, only: [:index, :create, :show, :update, :destroy]
    end
  end
end 