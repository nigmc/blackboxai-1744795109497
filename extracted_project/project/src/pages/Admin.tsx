import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Edit, Upload, Calculator, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types/product';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id?: string;
}

const Admin = () => {
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [markupPercentage, setMarkupPercentage] = useState<number>(30);
  const [bulkImport, setBulkImport] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setProducts(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setCategories(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const finalPrice = calculateMarkupPrice(parseFloat(form.price));
      
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: form.name,
            description: form.description,
            price: finalPrice,
            image_url: form.image_url,
            category_id: form.category_id || null,
          })
          .eq('id', editingProduct);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Product updated successfully!' });
        setEditingProduct(null);
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            name: form.name,
            description: form.description,
            price: finalPrice,
            image_url: form.image_url,
            category_id: form.category_id || null,
          });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Product added successfully!' });
      }

      setForm({ name: '', description: '', price: '', image_url: '', category_id: '' });
      fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      category_id: product.category_id || '',
    });
    setEditingProduct(product.id);
  };

  const calculateMarkupPrice = (basePrice: number) => {
    return basePrice * (1 + markupPercentage / 100);
  };

  const handleBulkImport = async () => {
    try {
      const products = JSON.parse(bulkImport);
      setLoading(true);

      for (const product of products) {
        const finalPrice = calculateMarkupPrice(product.price);
        await supabase.from('products').insert({
          name: product.name,
          description: product.description,
          price: finalPrice,
          image_url: product.image_url,
          category_id: product.category_id,
        });
      }

      setMessage({ type: 'success', text: 'Products imported successfully!' });
      setBulkImport('');
      fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid JSON format or import failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-8">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>

          {message && (
            <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price ($)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-sm text-gray-600">
                    Final: ${form.price ? calculateMarkupPrice(parseFloat(form.price)).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : editingProduct ? (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Update Product</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Add Product</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Price Markup Settings</h3>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                min="0"
                max="1000"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">% markup on base price</span>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Bulk Import</h3>
            <textarea
              value={bulkImport}
              onChange={(e) => setBulkImport(e.target.value)}
              placeholder="Paste JSON array of products..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              onClick={handleBulkImport}
              disabled={loading || !bulkImport}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              <Upload className="h-5 w-5" />
              <span>Import Products</span>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8">Product List</h2>
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-gray-600">${product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;