import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { HeroSection } from '@/sections/HeroSection';
import { CatalogSection } from '@/sections/CatalogSection';
import { CheckoutSection } from '@/sections/CheckoutSection';
import { OrderSummarySection } from '@/sections/OrderSummarySection';
import { ContactSection } from '@/sections/ContactSection';
import { FooterSection } from '@/sections/FooterSection';
import { useCart } from '@/hooks/useCart';
import { products, featuredProduct } from '@/data/products';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import type { CustomerData, PaymentMethod, View } from '@/types';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function CustomerStore() {
  const {
    items,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  const [view, setView] = useState<View>('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mbway');

  const mainRef = useRef<HTMLElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

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

  // FUNÇÃO CORRIGIDA PARA O WHATSAPP
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

    // Opcional: Descomente as linhas abaixo se quiser limpar o carrinho após enviar
    // clearCart();
    // setView('catalog');
  }, [customerData, items, paymentMethod]);

  const prontaEntregaProducts = products.filter(p => p.availability === 'pronta-entrega');
  const porEncomendaProducts = products.filter(p => p.availability === 'por-encomenda');

  useEffect(() => {
    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value;
            return pinnedRanges.reduce(
              (closest, r) => Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
            title="Pronta entrega"
            subtitle="Os favoritos de sempre — envio em 24h."
            products={prontaEntregaProducts}
            onAddToCart={addToCart}
          />
        </div>

        <CatalogSection
          title="Por encomenda"
          subtitle="Edições especiais e kits personalizados."
          products={porEncomendaProducts}
          onAddToCart={addToCart}
        />

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

export default function App() {
  return <CustomerStore />;
}
