export interface Product {
  id: string;
  alibaba_id?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}