export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryId: string;
  availability: 'pronta-entrega' | 'por-encomenda';
  description?: string;
  inStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  company?: string;
  country: string;
  address: string;
  locality: string;
  district: string;
  postalCode: string;
  phone: string;
  email: string;
  nif?: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerData;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  totalAmount?: number;
  notes?: string;
}

export type PaymentMethod = 'cartao' | 'multibanco' | 'mbway' | 'transferencia';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
}

export interface MonthlySales {
  month: string;
  year: number;
  amount: number;
  target?: number;
  notes?: string;
}

export interface DashboardStats {
  monthlySales: MonthlySales;
  pendingOrders: number;
  totalOrders: number;
  totalProducts: number;
  activeProducts: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}
