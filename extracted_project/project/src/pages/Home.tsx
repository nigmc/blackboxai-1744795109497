import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-90 rounded-xl"></div>
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
          alt="E-commerce Banner"
          className="w-full h-[500px] object-cover rounded-xl"
        />
        <div className="absolute inset-0 flex items-center justify-start px-12">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">Welcome to GlobalMart</h1>
            <p className="text-xl mb-8">Discover amazing products from around the world at unbeatable prices.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Global Selection</h3>
          <p className="text-gray-600">Access to millions of products from verified suppliers worldwide.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Secure Shopping</h3>
          <p className="text-gray-600">Protected payments and verified sellers for your peace of mind.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
          <p className="text-gray-600">Quick delivery options available for all your purchases.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;