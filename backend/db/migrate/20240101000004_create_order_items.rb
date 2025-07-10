class CreateOrderItems < ActiveRecord::Migration[7.0]
  def change
    create_table :order_items do |t|
      t.integer :quantity, null: false
      t.decimal :price, precision: 10, scale: 2, null: false
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true

      t.timestamps
    end
  end
end 