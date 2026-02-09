import type { Product, Order, AdminUser, MonthlySales, Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Admin user (senha: admin123)
export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    name: 'Administrador',
    passwordHash: '$2b$10$YourHashHere' // Em produção, usar bcrypt
  }
];

// Categories - In-memory database
export let categories: Category[] = [];

// Initialize categories from in-memory storage
export const initCategories = async () => {
  try {
    // Use in-memory database as fallback (Supabase unavailable in development)
    const defaults: Category[] = [
      { id: uuidv4(), name: 'Perfumes Mulher', slug: 'perfumes-mulher', description: 'Fragrâncias femininas', order: 1, isActive: true, createdAt: new Date().toISOString() },
      { id: uuidv4(), name: 'Perfumes Homem', slug: 'perfumes-homem', description: 'Fragrâncias masculinas', order: 2, isActive: true, createdAt: new Date().toISOString() },
      { id: uuidv4(), name: 'Maquilhagem', slug: 'maquilhagem', description: 'Produtos de maquilhagem', order: 3, isActive: true, createdAt: new Date().toISOString() },
      { id: uuidv4(), name: 'Cuidados de Pele', slug: 'cuidados-pele', description: 'Cremes e tratamentos', order: 4, isActive: true, createdAt: new Date().toISOString() },
      { id: uuidv4(), name: 'Cabelos', slug: 'cabelos', description: 'Produtos capilares', order: 5, isActive: true, createdAt: new Date().toISOString() },
    ];

    categories = defaults;
    console.log('✓ Categories initialized from in-memory database');
    return categories;
  } catch (error) {
    console.error('Error initializing categories:', error);
    return [];
  }
};

// Products - In-memory database
export let products: Product[] = [];

// Initialize products from in-memory storage
export const initProducts = async () => {
  try {
    // Create default products with category references
    const catSlugs: Record<string, string> = {};
    categories.forEach(c => {
      catSlugs[c.slug] = c.id;
    });

    const defaults: Product[] = [
      {
        id: uuidv4(),
        name: 'Malbec Gold Desodorante',
        price: 18.90,
        image: '/images/products/malbec_gold.jpg',
        category: 'Perfumes Homem',
        categoryId: catSlugs['perfumes-homem'],
        availability: 'pronta-entrega',
        description: 'Desodorante colônia masculino com notas amadeiradas e especiadas.',
        inStock: true,
        isActive: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Coffee Woman Seduction',
        price: 22.00,
        image: '/images/products/coffee_woman.jpg',
        category: 'Perfumes Mulher',
        categoryId: catSlugs['perfumes-mulher'],
        availability: 'pronta-entrega',
        description: 'Fragrância feminina sensual com notas de café e baunilha.',
        inStock: true,
        isActive: true,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    products = defaults;
    console.log('✓ Products initialized from in-memory database');
    return products;
  } catch (error) {
    console.error('Error initializing products:', error);
    return [];
  }
};

// Orders - In-memory database
export let orders: Order[] = [];

// Monthly Sales - In-memory database
export let monthlySales: MonthlySales[] = [
  {
    month: 'Janeiro',
    year: 2026,
    amount: 1250.00,
    target: 2000.00,
    notes: 'Início de ano bom'
  }
];

// Helper functions for products
export const getProducts = async (): Promise<Product[]> => {
  return products;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  return products.find(p => p.id === id) || null;
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { userId?: string }): Promise<Product> => {
  const newProduct: Product = {
    id: uuidv4(),
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(newProduct);
  console.log(`✓ Product created: ${newProduct.name} (${newProduct.id})`);
  return newProduct;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
  console.log(`✓ Product updated: ${products[index].name} (${id})`);
  return products[index];
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;

  const deleted = products.splice(index, 1);
  console.log(`✓ Product deleted: ${deleted[0].name}`);
  return true;
};

// Helper functions for orders
export const addOrder = (order: Order): Order => {
  orders.unshift(order);
  console.log(`✓ Order created: ${order.id}`);
  return order;
};

export const updateOrder = (id: string, updates: Partial<Order>): Order | null => {
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;

  orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
  console.log(`✓ Order updated: ${id}`);
  return orders[index];
};

// Helper functions for monthly sales
export const updateMonthlySales = (month: string, year: number, amount: number, notes?: string): MonthlySales => {
  const index = monthlySales.findIndex(s => s.month === month && s.year === year);

  if (index !== -1) {
    monthlySales[index] = { ...monthlySales[index], amount, notes };
  } else {
    const newSales: MonthlySales = { month, year, amount, notes };
    monthlySales.push(newSales);
    return newSales;
  }

  return monthlySales[index];
};

// Helper functions for categories
export const getCategories = async (): Promise<Category[]> => {
  return categories;
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  return categories.find(c => c.id === id) || null;
};

export const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> => {
  const newCategory: Category = {
    id: uuidv4(),
    ...category,
    isActive: category.isActive !== undefined ? category.isActive : true,
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  console.log(`✓ Category created: ${newCategory.name}`);
  return newCategory;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  categories[index] = { ...categories[index], ...updates };
  console.log(`✓ Category updated: ${categories[index].name}`);
  return categories[index];
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return false;

  const deleted = categories.splice(index, 1);
  console.log(`✓ Category deleted: ${deleted[0].name}`);
  return true;
};
