class Api::V1::AuthController < ApplicationController
  # Authentication controller for user signup, signin, and signout
  # Handles JWT token generation and user authentication
  # Remove the skip_before_action since we don't have authenticate_user anymore
  # skip_before_action :authenticate_user, only: [:signin, :signup]

  def signup
    user = User.new(user_params)
    
    if user.save
      token = generate_token(user.id)
      render json: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          store_name: user.store_name
        },
        token: token
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def signin
    user = User.find_by(email: params[:email])
    
    if user&.authenticate(params[:password])
      token = generate_token(user.id)
      render json: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          store_name: user.store_name
        },
        token: token
      }
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def signout
    # In a real app, you might want to blacklist the token
    render json: { message: 'Successfully signed out' }
  end

  def me
    require_authentication
    return if performed? # Stop execution if authentication failed
    
    render json: {
      user: {
        id: @current_user.id,
        name: @current_user.name,
        email: @current_user.email,
        store_name: @current_user.store_name
      }
    }
  end

  private

  def user_params
    # Handle both camelCase (storeName) and snake_case (store_name) parameters
    user_params_raw = params.require(:user).permit(:name, :email, :password, :password_confirmation, :store_name, :storeName)
    
    # Convert storeName to store_name if present
    if user_params_raw[:storeName].present?
      user_params_raw[:store_name] = user_params_raw[:storeName]
      user_params_raw.delete(:storeName)
    end
    
    user_params_raw
  end

  def generate_token(user_id)
    JWT.encode({ user_id: user_id, exp: 24.hours.from_now.to_i }, 'your-secret-key-here')
  end
end 