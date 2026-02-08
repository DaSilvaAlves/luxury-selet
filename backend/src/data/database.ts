import type { Product, Order, AdminUser, MonthlySales, Category } from '../types';
import prisma from '../lib/prisma';

// Admin user (senha: admin123)
export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    name: 'Administrador',
    passwordHash: '$2b$10$YourHashHere' // Em produção, usar bcrypt
  }
];

// Categories - Now handled via Prisma
export let categories: Category[] = [];

// Initialize categories from DB
export const initCategories = async () => {
  try {
    const dbCategories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });

    if (dbCategories.length === 0) {
      // Seed default categories
      const defaults = [
        { name: 'Perfumes Mulher', slug: 'perfumes-mulher', description: 'Fragrâncias femininas', order: 1 },
        { name: 'Perfumes Homem', slug: 'perfumes-homem', description: 'Fragrâncias masculinas', order: 2 },
        { name: 'Maquilhagem', slug: 'maquilhagem', description: 'Produtos de maquilhagem', order: 3 },
        { name: 'Cuidados de Pele', slug: 'cuidados-pele', description: 'Cremes e tratamentos', order: 4 },
        { name: 'Cabelos', slug: 'cabelos', description: 'Produtos capilares', order: 5 },
      ];

      for (const cat of defaults) {
        await prisma.category.create({ data: cat });
      }

      categories = await prisma.category.findMany({ orderBy: { order: 'asc' } }) as any;
    } else {
      categories = dbCategories as any;
    }
    return categories;
  } catch (error) {
    console.error('Error initializing categories:', error);
    return [];
  }
};

// Products - Now handled via Prisma
export let products: Product[] = [];

// Initialize products from DB
export const initProducts = async () => {
  try {
    const dbProducts = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });

    if (dbProducts.length === 0) {
      // Get categories to link products
      const dbCategories = await prisma.category.findMany();
      const catMap: Record<string, string> = {};
      dbCategories.forEach((c: any) => {
        catMap[c.slug] = c.id;
      });

      // Seed default products
      const defaults = [
        {
          name: 'Malbec Gold Desodorante',
          price: 18.90,
          image: '/images/products/malbec_gold.jpg',
          categoryName: 'perfumes',
          categoryId: catMap['perfumes-mulher'] || catMap['perfumes-homem'],
          availability: 'pronta-entrega',
          description: 'Desodorante colônia masculino com notas amadeiradas e especiadas.',
          inStock: true,
          isActive: true,
          isFeatured: false,
        },
        {
          name: 'Coffee Woman Seduction',
          price: 22.00,
          image: '/images/products/coffee_woman.jpg',
          categoryName: 'perfumes',
          categoryId: catMap['perfumes-mulher'],
          availability: 'pronta-entrega',
          description: 'Fragrância feminina sensual com notas de café e baunilha.',
          inStock: true,
          isActive: true,
          isFeatured: true,
        },
        // Adicionar outros se necessário mas estes já servem de exemplo
      ];

      for (const prod of defaults) {
        if (prod.categoryId) {
          await prisma.product.create({ data: prod as any });
        }
      }

      products = await getProducts() as any;
    } else {
      products = dbProducts.map(mapDbToProduct) as any;
    }
    return products;
  } catch (error) {
    console.error('Error initializing products:', error);
    return [];
  }
};

// Helper to map DB Product to interface Product
const mapDbToProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    originalPrice: dbProduct.originalPrice || undefined,
    image: dbProduct.image,
    category: dbProduct.categoryName,
    categoryId: dbProduct.categoryId,
    availability: dbProduct.availability as any,
    description: dbProduct.description || undefined,
    inStock: dbProduct.inStock,
    isActive: dbProduct.isActive,
    isFeatured: dbProduct.isFeatured,
    createdAt: dbProduct.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: dbProduct.updatedAt?.toISOString(),
  };
};

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
export const getProducts = async (): Promise<Product[]> => {
  const dbProducts = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  });
  products = dbProducts.map(mapDbToProduct) as any;
  return products;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const dbProduct = await prisma.product.findUnique({
    where: { id }
  });
  return dbProduct ? mapDbToProduct(dbProduct) : null;
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  const dbProduct = await prisma.product.create({
    data: {
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      categoryName: product.category || '',
      categoryId: product.categoryId,
      availability: product.availability as any,
      description: product.description,
      inStock: product.inStock,
      isActive: product.isActive,
      isFeatured: product.isFeatured || false,
    }
  });
  await getProducts(); // Sync cache
  return mapDbToProduct(dbProduct);
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  const data: any = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.price !== undefined) data.price = updates.price;
  if (updates.originalPrice !== undefined) data.originalPrice = updates.originalPrice;
  if (updates.image !== undefined) data.image = updates.image;
  if (updates.category !== undefined) data.categoryName = updates.category;
  if (updates.categoryId !== undefined) data.categoryId = updates.categoryId;
  if (updates.availability !== undefined) data.availability = updates.availability;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.inStock !== undefined) data.inStock = updates.inStock;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;
  if (updates.isFeatured !== undefined) data.isFeatured = updates.isFeatured;

  const dbProduct = await prisma.product.update({
    where: { id },
    data
  });
  await getProducts(); // Sync cache
  return mapDbToProduct(dbProduct);
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await prisma.product.delete({
      where: { id }
    });
    await getProducts(); // Sync cache
    return true;
  } catch (error) {
    return false;
  }
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

// Category management
export const getCategories = async (): Promise<Category[]> => {
  const dbCategories = await prisma.category.findMany({
    orderBy: { order: 'asc' }
  });
  categories = dbCategories as any;
  return categories;
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  return await prisma.category.findUnique({
    where: { id }
  }) as Category | null;
};

export const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> => {
  const newCategory = await prisma.category.create({
    data: {
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
    }
  });
  await getCategories(); // Sync local cache
  return newCategory as any;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: updates.name,
      slug: updates.slug,
      description: updates.description,
      order: updates.order,
      isActive: updates.isActive,
    }
  });
  await getCategories(); // Sync local cache
  return updated as any;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    await prisma.category.delete({
      where: { id }
    });
    await getCategories(); // Sync local cache
    return true;
  } catch (error) {
    return false;
  }
};
