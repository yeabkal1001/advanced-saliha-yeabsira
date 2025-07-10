class CreateOrders < ActiveRecord::Migration[7.0]
  def change
    create_table :orders do |t|
      t.string :status, default: 'pending', null: false
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.string :shipping_address
      t.string :billing_address
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    
    add_index :orders, :status
  end
end 