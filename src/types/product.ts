export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: 'equipment' | 'supplement';
  created_at: string;
}