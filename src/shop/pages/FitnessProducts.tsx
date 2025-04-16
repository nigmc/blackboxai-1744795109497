import React, { useEffect, useState } from 'react';
import { ShoppingCart, Dumbbell, HeartPulse } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { Product } from '../../types/product';

const FitnessProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('fitness_products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-8">Fitness Equipment & Supplements</h2>
      {products.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          No products available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                {product.category === 'equipment' ? (
                  <Dumbbell className="h-16 w-16 text-gray-400" />
                ) : (
                  <HeartPulse className="h-16 w-16 text-gray-400" />
                )}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FitnessProducts;