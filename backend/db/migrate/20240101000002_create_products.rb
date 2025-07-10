class CreateProducts < ActiveRecord::Migration[7.0]
  def change
    create_table :products do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string :category, null: false
      t.string :image_url
      t.integer :stock_quantity, default: 0
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    
    add_index :products, :category
    add_index :products, :title
  end
end 