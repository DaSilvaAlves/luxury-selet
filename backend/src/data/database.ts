import type { Product, Order, AdminUser, MonthlySales } from '../types';

// Admin user (senha: admin123)
export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    name: 'Administrador',
    passwordHash: '$2b$10$YourHashHere' // Em produção, usar bcrypt
  }
];

// Products
export let products: Product[] = [
  {
    id: 'malbec-gold',
    name: 'Malbec Gold Desodorante',
    price: 18.90,
    image: '/images/products/malbec_gold.jpg',
    category: 'perfumes',
    availability: 'pronta-entrega',
    description: 'Desodorante colônia masculino com notas amadeiradas e especiadas.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'coffee-woman',
    name: 'Coffee Woman Seduction',
    price: 22.00,
    image: '/images/products/coffee_woman.jpg',
    category: 'perfumes',
    availability: 'pronta-entrega',
    description: 'Fragrância feminina sensual com notas de café e baunilha.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'match-revitalizante',
    name: 'Match Revitalizante',
    price: 19.50,
    image: '/images/products/match_revitalizante.jpg',
    category: 'cremes',
    availability: 'pronta-entrega',
    description: 'Creme facial revitalizante com extratos botânicos.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'lily-creme',
    name: 'Lily Creme Acetinado',
    price: 15.00,
    image: '/images/products/lily_creme.jpg',
    category: 'cremes',
    availability: 'pronta-entrega',
    description: 'Hidratante corporal com fragrância floral delicada.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'egeo-dolce',
    name: 'Egeo Dolce',
    price: 21.00,
    image: '/images/products/egeo_dolce.jpg',
    category: 'perfumes',
    availability: 'pronta-entrega',
    description: 'Colônia feminina doce e envolvente.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'botica-dark-mint',
    name: 'Botica 214 Dark Mint',
    price: 45.00,
    image: '/images/products/botica_dark_mint.jpg',
    category: 'perfumes',
    availability: 'pronta-entrega',
    description: 'Eau de Parfum refrescante com notas de menta e especiarias.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'botica-vetiver',
    name: 'Botica 214 Vetiver',
    price: 52.00,
    image: '/images/products/botica_vetiver.jpg',
    category: 'perfumes',
    availability: 'por-encomenda',
    description: 'Eau de Parfum sofisticado com notas amadeiradas de vetiver.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'lily-absolu',
    name: 'Lily Absolu',
    price: 58.00,
    image: '/images/products/lily_absolu.jpg',
    category: 'perfumes',
    availability: 'por-encomenda',
    description: 'Fragrância floral intensa e sofisticada.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'kit-coffee',
    name: 'Kit Presente Coffee',
    price: 34.00,
    originalPrice: 42.00,
    image: '/images/products/kit_coffee.jpg',
    category: 'cremes',
    availability: 'por-encomenda',
    description: 'Kit completo com produtos da linha Coffee.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'egeo-vanilla',
    name: 'Egeo Vanilla',
    price: 24.00,
    image: '/images/products/egeo_vanilla.jpg',
    category: 'perfumes',
    availability: 'por-encomenda',
    description: 'Colônia com notas quentes de baunilha e caramelo.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'malbec-x',
    name: 'Malbec X',
    price: 48.00,
    image: '/images/products/malbec_x.jpg',
    category: 'perfumes',
    availability: 'por-encomenda',
    description: 'Fragrância masculina intensa e marcante.',
    inStock: true,
    isActive: true,
  },
  {
    id: 'match-micelar',
    name: 'Match Água Micelar',
    price: 16.00,
    image: '/images/products/match_micelar.jpg',
    category: 'maquilhagem',
    availability: 'por-encomenda',
    description: 'Água micelar demaquilante para todos os tipos de pele.',
    inStock: true,
    isActive: true,
  },
];

// Orders
export let orders: Order[] = [];

// Monthly Sales
export let monthlySales: MonthlySales[] = [
  {
    month: 'Janeiro',
    year: 2026,
    amount: 1250.00,
    target: 2000.00,
    notes: 'Início de ano bom'
  }
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  return products[index];
};

export const addOrder = (order: Order): Order => {
  orders.unshift(order);
  return order;
};

export const updateOrder = (id: string, updates: Partial<Order>): Order | null => {
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  
  orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
  return orders[index];
};

export const updateMonthlySales = (month: string, year: number, amount: number, notes?: string): MonthlySales => {
  const index = monthlySales.findIndex(s => s.month === month && s.year === year);
  
  if (index !== -1) {
    monthlySales[index] = { ...monthlySales[index], amount, notes };
    return monthlySales[index];
  }
  
  const newSales: MonthlySales = { month, year, amount, notes };
  monthlySales.push(newSales);
  return newSales;
};
