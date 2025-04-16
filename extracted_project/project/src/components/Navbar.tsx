import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Store, Home, Settings } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">GlobalMart</span>
          </Link>
          
          <div className="flex space-x-8">
            <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/products" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Store className="h-5 w-5" />
              <span>Products</span>
            </Link>
            <Link to="/cart" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
            </Link>
            <Link to="/admin" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
              <Settings className="h-5 w-5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;