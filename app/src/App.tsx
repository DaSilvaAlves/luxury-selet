import { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { AboutModal } from '@/components/AboutModal';
import { HeroSection } from '@/sections/HeroSection';
import { CatalogSection } from '@/sections/CatalogSection';
import { CheckoutSection } from '@/sections/CheckoutSection';
import { OrderSummarySection } from '@/sections/OrderSummarySection';
import { ContactSection } from '@/sections/ContactSection';
import { FooterSection } from '@/sections/FooterSection';
import { AdminLogin } from '@/admin/AdminLogin';
import { AdminDashboard } from '@/admin/AdminDashboard';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAdminAuth } from '@/hooks/useAdminAuth';
// Products are now managed via admin panel only
import { generateWhatsAppLink } from '@/utils/whatsapp';
import type { CustomerData, PaymentMethod, View, Product } from '@/types';
import './App.css';

function CustomerStore() {
  const {
    items,
    isLoaded: cartLoaded,
    addToCart,
    removeFromCart,
    updateQuantity
  } = useCart();

  const { products: storedProducts, isLoaded: productsLoaded, getFeaturedProduct } = useProducts();
  const { categories, isLoaded: categoriesLoaded } = useCategories();

  const [view, setView] = useState<View>('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mbway');

  const mainRef = useRef<HTMLElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  // Use ONLY stored products from admin (no mock data)
  const products: Product[] = storedProducts;

  // Featured product: product marked as featured, or first active, or null
  const featuredProduct = getFeaturedProduct();

  const scrollToCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    setView('checkout');
    const checkoutSection = document.getElementById('checkout');
    checkoutSection?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleFormSubmit = useCallback((data: CustomerData, method: PaymentMethod) => {
    setCustomerData(data);
    setPaymentMethod(method);
    setView('summary');
    setTimeout(() => {
      const summarySection = document.getElementById('summary');
      summarySection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleWhatsAppSend = useCallback(() => {
    if (!customerData || items.length === 0) return;

    const orderId = `#BOT-${Math.floor(1000 + Math.random() * 9000)}`;

    const whatsappUrl = generateWhatsAppLink({
      orderId,
      customer: customerData,
      items: items,
      total: items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
      paymentMethod: paymentMethod === 'mbway' ? 'MB WAY' :
        paymentMethod === 'multibanco' ? 'Multibanco' :
          paymentMethod === 'cartao' ? 'Cartão' : 'Transferência'
    });

    window.open(whatsappUrl, '_blank');
  }, [customerData, items, paymentMethod]);

  // Filter active products only
  const activeProducts = products.filter(p => p.isActive);

  const isLoaded = cartLoaded && productsLoaded && categoriesLoaded;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50">
      <div className="grain-overlay" />

      <Header
        cartItems={items}
        onCartClick={() => setIsCartOpen(true)}
        onLogoClick={() => {
          setView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAboutClick={() => setIsAboutOpen(true)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      <main ref={mainRef} className="relative">
        <HeroSection
          featuredProduct={featuredProduct}
          onAddToCart={addToCart}
          onScrollToCatalog={scrollToCatalog}
        />

        <div ref={catalogRef}>
          <CatalogSection
            id="catalog"
            products={activeProducts}
            categories={categories}
            onAddToCart={addToCart}
          />
        </div>

        <CheckoutSection
          id="checkout"
          items={items}
          onSubmit={handleFormSubmit}
        />

        {view === 'summary' && customerData && items.length > 0 && (
          <OrderSummarySection
            id="summary"
            items={items}
            customer={customerData}
            paymentMethod={paymentMethod}
            onConfirm={handleWhatsAppSend}
            onBack={() => setView('checkout')}
          />
        )}

        <ContactSection
          onWhatsAppClick={() => window.open('https://wa.me/351961281939', '_blank')}
        />

        <FooterSection />
      </main>
    </div>
  );
}

function AdminPanel() {
  const { isAuthenticated, login, logout, isLoading } = useAdminAuth();

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    // FIXED: Use real API login that saves token to localStorage
    return await login(username, password);
  };

  const handleLogout = () => {
    logout();
    window.location.hash = '';
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Mostrar painel admin se URL contém #admin
  if (currentRoute === '#admin') {
    return <AdminPanel />;
  }

  return <CustomerStore />;
}
