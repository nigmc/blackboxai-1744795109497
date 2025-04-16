import React from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Shopping Cart</h2>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center text-gray-500">
            <ShoppingBag className="h-16 w-16 mb-4" />
            <p className="text-lg">Your cart is empty</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold">$0.00</span>
        </div>
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          disabled
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;