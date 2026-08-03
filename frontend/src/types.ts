export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "customer";
  face_image: string | null;
  created_at: string;
}

export interface LoginResponse {
  authenticated: boolean;
  user: User | null;
  message: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
