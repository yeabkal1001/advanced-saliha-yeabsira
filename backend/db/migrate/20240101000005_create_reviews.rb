class CreateReviews < ActiveRecord::Migration[7.0]
  def change
    create_table :reviews do |t|
      t.integer :rating, null: false
      t.text :comment, null: false
      t.references :user, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true

      t.timestamps
    end
    
    add_index :reviews, [:user_id, :product_id], unique: true
  end
end 