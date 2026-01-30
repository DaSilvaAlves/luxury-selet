import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  LogOut,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  X
} from 'lucide-react';
import type { Order, Product, DashboardStats } from '@/types';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Mock data for demonstration
const mockStats: DashboardStats = {
  monthlySales: {
    month: 'Janeiro',
    year: 2026,
    amount: 1250.00,
    target: 2000.00,
  },
  pendingOrders: 3,
  totalOrders: 12,
  totalProducts: 12,
  activeProducts: 12,
};

const mockOrders: Order[] = [
  {
    id: 'BOT-1024',
    items: [
      { product: { id: '1', name: 'Lily Eau de Parfum', price: 42.50, image: '', category: 'perfumes', availability: 'pronta-entrega', inStock: true, isActive: true }, quantity: 1 },
      { product: { id: '2', name: 'Malbec Gold Desodorante', price: 18.90, image: '', category: 'perfumes', availability: 'pronta-entrega', inStock: true, isActive: true }, quantity: 2 },
    ],
    customer: {
      firstName: 'Maria',
      lastName: 'Silva',
      country: 'Portugal',
      address: 'Rua das Flores, 123',
      locality: 'Lisboa',
      district: 'Lisboa',
      postalCode: '1000-001',
      phone: '+351 910 000 000',
      email: 'maria@email.com',
    },
    paymentMethod: 'mbway',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'BOT-1023',
    items: [
      { product: { id: '3', name: 'Coffee Woman Seduction', price: 22.00, image: '', category: 'perfumes', availability: 'pronta-entrega', inStock: true, isActive: true }, quantity: 1 },
    ],
    customer: {
      firstName: 'Ana',
      lastName: 'Santos',
      country: 'Portugal',
      address: 'Av. da Liberdade, 45',
      locality: 'Porto',
      district: 'Porto',
      postalCode: '4000-001',
      phone: '+351 920 000 000',
      email: 'ana@email.com',
    },
    paymentMethod: 'transferencia',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockProducts: Product[] = [
  { id: 'malbec-gold', name: 'Malbec Gold Desodorante', price: 18.90, image: '/images/products/malbec_gold.jpg', category: 'perfumes', availability: 'pronta-entrega', inStock: true, isActive: true },
  { id: 'coffee-woman', name: 'Coffee Woman Seduction', price: 22.00, image: '/images/products/coffee_woman.jpg', category: 'perfumes', availability: 'pronta-entrega', inStock: true, isActive: true },
  { id: 'match-revitalizante', name: 'Match Revitalizante', price: 19.50, image: '/images/products/match_revitalizante.jpg', category: 'cremes', availability: 'pronta-entrega', inStock: true, isActive: true },
];

type Tab = 'dashboard' | 'products' | 'orders';

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: X },
};

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [salesAmount, setSalesAmount] = useState(stats.monthlySales.amount.toString());

  const handleUpdateSales = () => {
    const amount = parseFloat(salesAmount);
    if (!isNaN(amount)) {
      setStats(prev => ({
        ...prev,
        monthlySales: { ...prev.monthlySales, amount }
      }));
    }
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const salesProgress = (stats.monthlySales.amount / (stats.monthlySales.target || 1)) * 100;

  return (
    <div className="min-h-screen bg-sage-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sage-200 flex-shrink-0">
        <div className="p-6">
          <h1 className="font-heading font-bold text-xl text-sage-900">
            O Boticário <span className="text-gold-500">Admin</span>
          </h1>
        </div>

        <nav className="px-4 pb-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-gold-50 text-gold-700' 
                : 'text-sage-600 hover:bg-sage-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mt-1 ${
              activeTab === 'products' 
                ? 'bg-gold-50 text-gold-700' 
                : 'text-sage-600 hover:bg-sage-50'
            }`}
          >
            <Package className="w-5 h-5" />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mt-1 ${
              activeTab === 'orders' 
                ? 'bg-gold-50 text-gold-700' 
                : 'text-sage-600 hover:bg-sage-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Pedidos
            {stats.pendingOrders > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {stats.pendingOrders}
              </span>
            )}
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-sage-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sage-600 hover:bg-sage-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-sage-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-sage-900">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'products' && 'Gestão de Produtos'}
              {activeTab === 'orders' && 'Histórico de Pedidos'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-sage-500">Admin</span>
              <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                <span className="text-gold-700 font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Monthly Sales */}
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-gold-600" />
                    </div>
                    <span className="text-xs text-sage-500 bg-sage-100 px-2 py-1 rounded-full">
                      {stats.monthlySales.month}
                    </span>
                  </div>
                  <p className="text-sm text-sage-500 mb-1">Vendas do Mês</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={salesAmount}
                      onChange={(e) => setSalesAmount(e.target.value)}
                      onBlur={handleUpdateSales}
                      className="text-2xl font-heading font-bold text-sage-900 bg-transparent border-b border-transparent hover:border-sage-200 focus:border-gold-500 focus:outline-none w-32"
                    />
                    <span className="text-sage-400">€</span>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold-500 rounded-full transition-all"
                        style={{ width: `${Math.min(salesProgress, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-sage-500 mt-1">
                      Meta: €{(stats.monthlySales.target || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Pending Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-sm text-sage-500 mb-1">Pedidos Pendentes</p>
                  <p className="text-3xl font-heading font-bold text-sage-900">
                    {stats.pendingOrders}
                  </p>
                  <p className="text-xs text-sage-500 mt-2">
                    Total: {stats.totalOrders} pedidos
                  </p>
                </div>

                {/* Products */}
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-sage-500 mb-1">Produtos Ativos</p>
                  <p className="text-3xl font-heading font-bold text-sage-900">
                    {stats.activeProducts}
                  </p>
                  <p className="text-xs text-sage-500 mt-2">
                    Total: {stats.totalProducts} produtos
                  </p>
                </div>

                {/* Quick Action */}
                <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-6 text-white">
                  <p className="text-sm text-white/80 mb-2">Ação Rápida</p>
                  <p className="font-heading font-bold text-lg mb-4">
                    Ver pedidos pendentes
                  </p>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors text-sm"
                  >
                    Ver agora
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="p-6 border-b border-sage-100">
                  <h3 className="font-heading font-bold text-lg text-sage-900">
                    Pedidos Recentes
                  </h3>
                </div>
                <div className="divide-y divide-sage-100">
                  {orders.slice(0, 3).map((order) => {
                    const status = statusLabels[order.status];
                    const StatusIcon = status.icon;
                    return (
                      <div key={order.id} className="p-4 flex items-center justify-between hover:bg-sage-50">
                        <div>
                          <p className="font-medium text-sage-900">#{order.id}</p>
                          <p className="text-sm text-sage-500">
                            {order.customer.firstName} {order.customer.lastName}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                          <span className="text-sage-900 font-medium">
                            €{order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-sage-100">
                <h3 className="font-heading font-bold text-lg text-sage-900">
                  Todos os Produtos
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sage-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Produto</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Preço</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Stock</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Estado</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-sage-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-sage-100 overflow-hidden">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-sage-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sage-900">€{product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                              <span className="text-sage-400 line-through text-sm">
                                €{product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.inStock 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.inStock ? 'Em stock' : 'Sem stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-gold-600 hover:text-gold-700 font-medium text-sm"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-sage-100">
                <h3 className="font-heading font-bold text-lg text-sage-900">
                  Todos os Pedidos
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sage-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Pedido</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Cliente</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Total</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Estado</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Data</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-100">
                    {orders.map((order) => {
                      const status = statusLabels[order.status];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={order.id} className="hover:bg-sage-50">
                          <td className="px-6 py-4">
                            <span className="font-medium text-sage-900">#{order.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sage-900">{order.customer.firstName} {order.customer.lastName}</p>
                            <p className="text-sm text-sage-500">{order.customer.phone}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-sage-900">
                              €{order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sage-500">
                            {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                              className="text-sm border border-sage-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
                            >
                              <option value="pending">Pendente</option>
                              <option value="confirmed">Confirmado</option>
                              <option value="shipped">Enviado</option>
                              <option value="delivered">Entregue</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-heading font-bold text-lg text-sage-900 mb-4">
              Editar Produto
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Preço (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="w-full input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Preço Promocional (€) (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.originalPrice || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full input-field"
                  placeholder="Deixe vazio se não houver promoção"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="w-5 h-5 rounded border-sage-300 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-sage-700">Em stock</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.isActive}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-sage-300 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-sage-700">Ativo</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-3 border border-sage-200 rounded-xl text-sage-700 hover:bg-sage-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateProduct(editingProduct)}
                className="flex-1 btn-primary py-3"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
