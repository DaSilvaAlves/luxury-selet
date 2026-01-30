import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface CatalogSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  id?: string;
}

export function CatalogSection({ title, subtitle, products, onAddToCart, id }: CatalogSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cards = cardsRef.current;

    if (!section || !header || !cards) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(header,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Cards animation
      const cardElements = cards.querySelectorAll('.product-card');
      cardElements.forEach((card, index) => {
        gsap.fromTo(card,
          { y: 60, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id={id}
      className="py-16 lg:py-24 section-padding"
      style={{ zIndex: 20 }}
    >
      {/* Header */}
      <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 lg:mb-14">
        <div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading font-extrabold text-sage-900 mb-2">
            {title}
          </h2>
          <p className="text-sage-600 text-lg">
            {subtitle}
          </p>
        </div>
        <button className="flex items-center gap-2 text-gold-600 font-medium hover:text-gold-700 transition-colors group">
          Ver tudo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Product Grid */}
      <div 
        ref={cardsRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {products.map((product) => (
          <div 
            key={product.id}
            className="product-card card-product group"
          >
            {/* Image */}
            <div className="aspect-[3/4] overflow-hidden bg-sage-100">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-heading font-semibold text-sage-900 mb-2 line-clamp-1">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gold-600 font-bold text-lg">
                  €{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sage-400 line-through text-sm">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <button
                onClick={() => onAddToCart(product)}
                className="w-full flex items-center justify-center gap-2 bg-sage-900 text-white py-3 rounded-xl font-medium hover:bg-sage-800 transition-colors active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
