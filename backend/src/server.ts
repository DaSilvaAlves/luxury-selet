import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { products, orders, monthlySales, adminUsers, categories, addOrder, updateOrder, updateProduct, updateMonthlySales, addCategory, updateCategory, deleteCategory, getCategoryById } from './data/database';
import type { Order, CustomerData, PaymentMethod } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    (req as any).user = user;
    next();
  });
};

// ========== PUBLIC ROUTES ==========

// Get all products
app.get('/api/products', (req, res) => {
  const activeProducts = products.filter(p => p.isActive);
  res.json(activeProducts);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Create order (from checkout)
app.post('/api/orders', (req, res) => {
  const { items, customer, paymentMethod } = req.body;

  if (!items || !customer || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const order: Order = {
    id: `BOT-${Math.floor(1000 + Math.random() * 9000)}`,
    items,
    customer,
    paymentMethod: paymentMethod as PaymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addOrder(order);
  res.status(201).json(order);
});

// ========== ADMIN ROUTES ==========

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Simple password check (em produção usar bcrypt)
  if (username === 'admin' && password === 'admin123') {
    const user = { id: 'admin-1', username: 'admin', name: 'Administrador' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get dashboard stats
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  const currentMonth = new Date().toLocaleString('pt-PT', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const monthSales = monthlySales.find(
    s => s.month.toLowerCase() === currentMonth.toLowerCase() && s.year === currentYear
  ) || { month: currentMonth, year: currentYear, amount: 0 };

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const stats = {
    monthlySales: monthSales,
    pendingOrders,
    totalOrders: orders.length,
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isActive).length,
  };

  res.json(stats);
});

// Update monthly sales
app.put('/api/admin/sales', authenticateToken, (req, res) => {
  const { amount, notes } = req.body;
  const currentMonth = new Date().toLocaleString('pt-PT', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const updated = updateMonthlySales(currentMonth, currentYear, amount, notes);
  res.json(updated);
});

// ========== PRODUCTS MANAGEMENT ==========

// Get all products (admin)
app.get('/api/admin/products', authenticateToken, (req, res) => {
  res.json(products);
});

// Update product
app.put('/api/admin/products/:id', authenticateToken, (req, res) => {
  const { price, originalPrice, inStock, isActive } = req.body;

  const updated = updateProduct(req.params.id, {
    price,
    originalPrice,
    inStock,
    isActive,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(updated);
});

// ========== CATEGORIES MANAGEMENT ==========

// Get all categories
app.get('/api/admin/categories', authenticateToken, (req, res) => {
  res.json(categories);
});

// Create category
app.post('/api/admin/categories', authenticateToken, (req, res) => {
  const { name, slug, description, isActive, order } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const newCategory = addCategory({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description,
    isActive: isActive ?? true,
    order: order ?? categories.length + 1,
  });

  res.status(201).json(newCategory);
});

// Update category
app.put('/api/admin/categories/:id', authenticateToken, (req, res) => {
  const { name, slug, description, isActive, order } = req.body;

  const updated = updateCategory(req.params.id, {
    name,
    slug,
    description,
    isActive,
    order,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json(updated);
});

// Delete category
app.delete('/api/admin/categories/:id', authenticateToken, (req, res) => {
  const deleted = deleteCategory(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({ success: true });
});

// ========== ORDERS MANAGEMENT ==========

// Get all orders
app.get('/api/admin/orders', authenticateToken, (req, res) => {
  res.json(orders);
});

// Get order by ID
app.get('/api/admin/orders/:id', authenticateToken, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Update order status
app.patch('/api/admin/orders/:id/status', authenticateToken, (req, res) => {
  const { status, notes } = req.body;
  
  const updated = updateOrder(req.params.id, { status, notes });
  
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(updated);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Products loaded: ${products.length}`);
  console.log(`🔐 Admin login: admin / admin123`);
});
