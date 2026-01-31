import { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Settings,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  Save,
  X,
  Image as ImageIcon,
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  Star
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useDataBackup } from '@/hooks/useDataBackup';
import { useAuth } from '@/hooks/useAuth';
import type { Product, Category } from '@/types';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'dashboard' | 'products' | 'categories' | 'settings';

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const {
    products,
    isLoaded: productsLoaded,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    setFeaturedProduct
  } = useProducts();
  const {
    categories,
    isLoaded: categoriesLoaded,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  } = useCategories();
  const { exportData, importData, getStorageSize } = useDataBackup();
  const { updateCredentials, isUsingDefaultCredentials, getCurrentUsername } = useAuth();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [credentialsMessage, setCredentialsMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    image: '',
    categoryId: '',
    availability: 'pronta-entrega',
    description: '',
    inStock: true,
    isActive: true,
  });

  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    isActive: true,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, forEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Imagem muito grande! Máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (forEditing && editingProduct) {
        setEditingProduct({ ...editingProduct, image: base64 });
      } else {
        setNewProduct({ ...newProduct, image: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    addProduct({
      name: newProduct.name,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice,
      image: newProduct.image || '/images/placeholder.jpg',
      categoryId: newProduct.categoryId,
      availability: newProduct.availability || 'pronta-entrega',
      description: newProduct.description,
      inStock: newProduct.inStock ?? true,
      isActive: newProduct.isActive ?? true,
    });

    setNewProduct({
      name: '',
      price: 0,
      image: '',
      categoryId: '',
      availability: 'pronta-entrega',
      description: '',
      inStock: true,
      isActive: true,
    });
    setIsAddingProduct(false);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
  };

  const handleSaveCategory = () => {
    if (!newCategory.name) {
      alert('Preencha o nome da categoria');
      return;
    }

    addCategory({
      name: newCategory.name,
      slug: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      description: newCategory.description,
      isActive: newCategory.isActive ?? true,
    });

    setNewCategory({
      name: '',
      description: '',
      isActive: true,
    });
    setIsAddingCategory(false);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    updateCategory(editingCategory.id, editingCategory);
    setEditingCategory(null);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importData(file);
    setImportMessage(result.message);

    if (result.success) {
      // Reload page to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleExport = () => {
    exportData();
    setImportMessage('Cópia guardada! Veja na pasta de Downloads do seu computador.');
    setTimeout(() => setImportMessage(null), 5000);
  };

  const handleUpdateCredentials = () => {
    if (newPassword !== confirmPassword) {
      setCredentialsMessage({ success: false, text: 'As senhas não coincidem.' });
      return;
    }

    const result = updateCredentials(newUsername, newPassword);
    setCredentialsMessage({ success: result.success, text: result.message });

    if (result.success) {
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setCredentialsMessage(null), 5000);
    }
  };

  const storageSize = getStorageSize();

  if (!productsLoaded || !categoriesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sage-200 flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h1 className="font-heading font-bold text-xl text-sage-900">
            Luxury Selet <span className="text-gold-500">Admin</span>
          </h1>
        </div>

        <nav className="px-4 flex-1">
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
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mt-1 ${
              activeTab === 'categories'
                ? 'bg-gold-50 text-gold-700'
                : 'text-sage-600 hover:bg-sage-50'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            Categorias
            <span className="ml-auto text-xs bg-sage-100 text-sage-600 px-2 py-0.5 rounded-full">
              {categories.length}
            </span>
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
            <span className="ml-auto text-xs bg-sage-100 text-sage-600 px-2 py-0.5 rounded-full">
              {products.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mt-1 ${
              activeTab === 'settings'
                ? 'bg-gold-50 text-gold-700'
                : 'text-sage-600 hover:bg-sage-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            Definições
          </button>
        </nav>

        <div className="p-4 border-t border-sage-100">
          <button
            onClick={() => { window.location.hash = ''; onLogout(); }}
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
              {activeTab === 'categories' && 'Gestão de Categorias'}
              {activeTab === 'settings' && 'Definições'}
            </h2>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                className="text-sm text-sage-500 hover:text-gold-600 transition-colors"
              >
                Ver Loja →
              </a>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-gold-600" />
                    </div>
                  </div>
                  <p className="text-sm text-sage-500 mb-1">Total de Produtos</p>
                  <p className="text-3xl font-heading font-bold text-sage-900">
                    {products.length}
                  </p>
                  <p className="text-xs text-sage-500 mt-2">
                    {products.filter(p => p.isActive).length} ativos
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-sage-500 mb-1">Categorias</p>
                  <p className="text-3xl font-heading font-bold text-sage-900">
                    {categories.length}
                  </p>
                  <p className="text-xs text-sage-500 mt-2">
                    {categories.filter(c => c.isActive).length} ativas
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Save className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-sm text-sage-500 mb-1">Armazenamento</p>
                  <p className="text-3xl font-heading font-bold text-sage-900">
                    {storageSize.formatted}
                  </p>
                  <p className="text-xs text-sage-500 mt-2">
                    localStorage usado
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-heading font-bold text-lg text-sage-900 mb-4">
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => { setActiveTab('products'); setIsAddingProduct(true); }}
                    className="flex items-center gap-3 p-4 bg-gold-50 rounded-xl hover:bg-gold-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gold-600" />
                    <span className="text-gold-700 font-medium">Adicionar Produto</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('categories'); setIsAddingCategory(true); }}
                    className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-medium">Adicionar Categoria</span>
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <Download className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Exportar Backup</span>
                  </button>
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="p-6 border-b border-sage-100">
                  <h3 className="font-heading font-bold text-lg text-sage-900">
                    Produtos Recentes
                  </h3>
                </div>
                <div className="divide-y divide-sage-100">
                  {products.slice(0, 5).map((product) => {
                    const category = getCategoryById(product.categoryId);
                    return (
                      <div key={product.id} className="p-4 flex items-center justify-between hover:bg-sage-50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-sage-100 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-sage-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sage-900">{product.name}</p>
                            <p className="text-sm text-sage-500">{category?.name || 'Sem categoria'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {product.isFeatured && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              Destaque
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                          <span className="text-sage-900 font-medium">
                            €{product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => setFeaturedProduct(product.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              product.isFeatured
                                ? 'text-amber-500 bg-amber-50'
                                : 'text-sage-400 hover:text-amber-500 hover:bg-amber-50'
                            }`}
                            title={product.isFeatured ? 'Produto em destaque' : 'Colocar em destaque'}
                          >
                            <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 text-sage-500 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem a certeza que deseja eliminar este produto?')) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-2 text-sage-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {products.length === 0 && (
                    <div className="p-8 text-center text-sage-500">
                      Ainda não há produtos. Clique em "Adicionar Produto" para começar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center gap-2 bg-gold-500 text-white px-4 py-2.5 rounded-xl hover:bg-gold-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Categoria
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="divide-y divide-sage-100">
                  {categories.map((category) => {
                    const productCount = products.filter(p => p.categoryId === category.id).length;
                    return (
                      <div key={category.id} className="p-4 flex items-center justify-between hover:bg-sage-50">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-sage-300 cursor-grab" />
                          <div>
                            <p className="font-medium text-sage-900">{category.name}</p>
                            <p className="text-sm text-sage-500">
                              {productCount} {productCount === 1 ? 'produto' : 'produtos'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {category.isActive ? 'Ativa' : 'Inativa'}
                          </span>
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="p-2 text-sage-500 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (productCount > 0) {
                                alert(`Não pode eliminar esta categoria porque tem ${productCount} produtos associados.`);
                                return;
                              }
                              if (confirm('Tem a certeza que deseja eliminar esta categoria?')) {
                                deleteCategory(category.id);
                              }
                            }}
                            className="p-2 text-sage-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {categories.length === 0 && (
                    <div className="p-8 text-center text-sage-500">
                      Ainda não há categorias. Clique em "Nova Categoria" para começar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="flex items-center gap-2 bg-gold-500 text-white px-4 py-2.5 rounded-xl hover:bg-gold-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-sage-50">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Produto</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Categoria</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Preço</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Estado</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-sage-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100">
                      {products.map((product) => {
                        const category = getCategoryById(product.categoryId);
                        return (
                          <tr key={product.id} className="hover:bg-sage-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-sage-100 overflow-hidden flex-shrink-0">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="w-6 h-6 text-sage-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sage-900 truncate">{product.name}</p>
                                  <p className="text-xs text-sage-500 truncate">{product.description || 'Sem descrição'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sage-600">{category?.name || 'Sem categoria'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sage-900 font-medium">€{product.price.toFixed(2)}</span>
                                {product.originalPrice && (
                                  <span className="text-sage-400 line-through text-sm">
                                    €{product.originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleProductActive(product.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                  product.isActive
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {product.isActive ? (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    Visível
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
                                    Oculto
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setFeaturedProduct(product.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    product.isFeatured
                                      ? 'text-amber-500 bg-amber-50'
                                      : 'text-sage-400 hover:text-amber-500 hover:bg-amber-50'
                                  }`}
                                  title={product.isFeatured ? 'Produto em destaque' : 'Colocar em destaque na capa'}
                                >
                                  <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="p-2 text-sage-500 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Tem a certeza que deseja eliminar este produto?')) {
                                      deleteProduct(product.id);
                                    }
                                  }}
                                  className="p-2 text-sage-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                    <div className="p-8 text-center text-sage-500">
                      Ainda não há produtos. Clique em "Novo Produto" para começar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {importMessage && (
                <div className={`p-4 rounded-xl ${
                  importMessage.includes('sucesso') || importMessage.includes('Importados')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {importMessage}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-heading font-bold text-lg text-sage-900 mb-4">
                  Guardar Cópia de Segurança
                </h3>
                <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-6">
                  <p className="text-sage-700 font-medium mb-2">
                    Como funciona:
                  </p>
                  <ol className="text-sage-600 text-sm space-y-1 list-decimal list-inside">
                    <li>Clique em <strong>"Guardar Cópia"</strong> - vai descarregar um ficheiro</li>
                    <li>Guarde esse ficheiro numa pasta do computador (ex: Documentos)</li>
                    <li>Se perder os dados, clique em "Recuperar" e escolha o ficheiro guardado</li>
                  </ol>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-gold-500 text-white px-6 py-3 rounded-xl hover:bg-gold-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Guardar Cópia
                  </button>
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="flex items-center gap-2 bg-sage-100 text-sage-700 px-6 py-3 rounded-xl hover:bg-sage-200 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Recuperar Cópia
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json,.txt"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-5 h-5 text-sage-600" />
                  <h3 className="font-heading font-bold text-lg text-sage-900">
                    Alterar Acesso ao Painel
                  </h3>
                </div>

                {isUsingDefaultCredentials() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 font-medium">Atenção!</p>
                      <p className="text-amber-700 text-sm">
                        Está a usar as credenciais padrão. Recomendamos que as altere para maior segurança.
                      </p>
                    </div>
                  </div>
                )}

                {credentialsMessage && (
                  <div className={`p-4 rounded-xl mb-4 ${
                    credentialsMessage.success
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {credentialsMessage.text}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Novo Utilizador
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder={`Atual: ${getCurrentUsername()}`}
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Confirmar Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <button
                    onClick={handleUpdateCredentials}
                    disabled={!newUsername || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 bg-gold-500 text-white px-6 py-3 rounded-xl hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    Guardar Novas Credenciais
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-heading font-bold text-lg text-sage-900 mb-4">
                  Resumo da Loja
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-sage-100">
                    <span className="text-sage-600">Produtos cadastrados</span>
                    <span className="text-sage-900 font-medium">{products.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-sage-100">
                    <span className="text-sage-600">Categorias criadas</span>
                    <span className="text-sage-900 font-medium">{categories.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h3 className="font-heading font-bold text-lg text-red-700 mb-4">
                  Começar do Zero
                </h3>
                <p className="text-red-600 mb-4">
                  Este botão apaga TODOS os produtos e categorias. Use apenas se quiser limpar tudo e começar de novo.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Tem a CERTEZA que deseja apagar TUDO? Todos os produtos e categorias serão eliminados!')) {
                      if (confirm('ÚLTIMA CONFIRMAÇÃO: Clique OK para apagar tudo.')) {
                        localStorage.removeItem('luxury-selet-products');
                        localStorage.removeItem('luxury-selet-categories');
                        window.location.reload();
                      }
                    }
                  }}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Apagar Tudo
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-sage-900">
                Novo Produto
              </h3>
              <button
                onClick={() => setIsAddingProduct(false)}
                className="p-2 hover:bg-sage-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-sage-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Imagem do Produto
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sage-200 rounded-xl p-4 cursor-pointer hover:border-gold-400 transition-colors"
                >
                  {newProduct.image ? (
                    <div className="relative">
                      <img
                        src={newProduct.image}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); setNewProduct({ ...newProduct, image: '' }); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 text-sage-500">
                      <Upload className="w-10 h-10 mb-2" />
                      <p className="text-sm">Clique para carregar imagem</p>
                      <p className="text-xs text-sage-400">PNG, JPG até 2MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Ex: Lily Eau de Parfum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  rows={3}
                  placeholder="Descrição breve do produto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Preço (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Preço Original (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.originalPrice || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: parseFloat(e.target.value) || undefined })}
                    className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="Para promoções"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.filter(c => c.isActive).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Disponibilidade
                </label>
                <select
                  value={newProduct.availability}
                  onChange={(e) => setNewProduct({ ...newProduct, availability: e.target.value as 'pronta-entrega' | 'por-encomenda' })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="pronta-entrega">Pronta Entrega</option>
                  <option value="por-encomenda">Por Encomenda</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newProduct.inStock}
                    onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                    className="w-5 h-5 rounded border-sage-300 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-sage-700">Em stock</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newProduct.isActive}
                    onChange={(e) => setNewProduct({ ...newProduct, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-sage-300 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-sm text-sage-700">Visível na loja</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddingProduct(false)}
                className="flex-1 py-3 border border-sage-200 rounded-xl text-sage-700 hover:bg-sage-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 bg-gold-500 text-white py-3 rounded-xl hover:bg-gold-600 transition-colors"
              >
                Guardar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-sage-900">
                Editar Produto
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 hover:bg-sage-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-sage-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Imagem do Produto
                </label>
                <div
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>, true);
                    input.click();
                  }}
                  className="border-2 border-dashed border-sage-200 rounded-xl p-4 cursor-pointer hover:border-gold-400 transition-colors"
                >
                  {editingProduct.image ? (
                    <img
                      src={editingProduct.image}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center py-6 text-sage-500">
                      <Upload className="w-10 h-10 mb-2" />
                      <p className="text-sm">Clique para alterar imagem</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Preço (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Preço Original (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseFloat(e.target.value) || undefined })}
                    className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Categoria
                </label>
                <select
                  value={editingProduct.categoryId}
                  onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Disponibilidade
                </label>
                <select
                  value={editingProduct.availability}
                  onChange={(e) => setEditingProduct({ ...editingProduct, availability: e.target.value as 'pronta-entrega' | 'por-encomenda' })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="pronta-entrega">Pronta Entrega</option>
                  <option value="por-encomenda">Por Encomenda</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-2">
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
                  <span className="text-sm text-sage-700">Visível na loja</span>
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
                onClick={handleUpdateProduct}
                className="flex-1 bg-gold-500 text-white py-3 rounded-xl hover:bg-gold-600 transition-colors"
              >
                Guardar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-sage-900">
                Nova Categoria
              </h3>
              <button
                onClick={() => setIsAddingCategory(false)}
                className="p-2 hover:bg-sage-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-sage-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Ex: Perfumes Mulher"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  rows={2}
                  placeholder="Descrição opcional..."
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCategory.isActive}
                  onChange={(e) => setNewCategory({ ...newCategory, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-sage-300 text-gold-500 focus:ring-gold-500"
                />
                <span className="text-sm text-sage-700">Categoria ativa</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddingCategory(false)}
                className="flex-1 py-3 border border-sage-200 rounded-xl text-sage-700 hover:bg-sage-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 bg-gold-500 text-white py-3 rounded-xl hover:bg-gold-600 transition-colors"
              >
                Criar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-sage-900">
                Editar Categoria
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-2 hover:bg-sage-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-sage-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-4 py-3 border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                  rows={2}
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCategory.isActive}
                  onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-sage-300 text-gold-500 focus:ring-gold-500"
                />
                <span className="text-sm text-sage-700">Categoria ativa</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-3 border border-sage-200 rounded-xl text-sage-700 hover:bg-sage-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateCategory}
                className="flex-1 bg-gold-500 text-white py-3 rounded-xl hover:bg-gold-600 transition-colors"
              >
                Guardar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
