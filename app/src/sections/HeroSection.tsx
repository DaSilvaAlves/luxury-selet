import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus } from 'lucide-react';
import type { Product } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  featuredProduct: Product;
  onAddToCart: (product: Product) => void;
  onScrollToCatalog: () => void;
}

export function HeroSection({ featuredProduct, onAddToCart, onScrollToCatalog }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const headline = headlineRef.current;
    const tile = tileRef.current;
    const cta = ctaRef.current;

    if (!section || !card || !headline || !tile || !cta) return;

    const ctx = gsap.context(() => {
      // Auto-play entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.fromTo(card, 
        { opacity: 0, scale: 0.98, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 1 }
      )
      .fromTo(headline.children,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.04 },
        '-=0.6'
      )
      .fromTo(tile,
        { opacity: 0, x: 60, scale: 0.96 },
        { opacity: 1, x: 0, scale: 1, duration: 0.8 },
        '-=0.5'
      )
      .fromTo(cta,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.5 },
        '-=0.3'
      );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements when scrolling back to top
            gsap.set([card, headline, tile, cta], { clearProps: 'all' });
            tl.progress(1);
          }
        }
      });

      // Exit animations (70-100%)
      scrollTl.fromTo(headline,
        { y: 0, opacity: 1 },
        { y: '-18vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(tile,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(card.querySelector('img'),
        { scale: 1, opacity: 1 },
        { scale: 1.06, opacity: 0.6, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(cta,
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-screen flex items-center justify-center pt-20"
      style={{ zIndex: 10 }}
    >
      {/* Hero Card */}
      <div 
        ref={cardRef}
        className="relative w-[92vw] h-[80vh] rounded-[28px] overflow-hidden shadow-card"
      >
        {/* Background Image */}
        <img 
          src="/images/backgrounds/hero_botanical.jpg" 
          alt="Botanical background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-6 lg:p-12 flex flex-col justify-between">
          {/* Top Label */}
          <div className="flex justify-between items-start">
            <span className="label-mono text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              NOVIDADE
            </span>
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Headline Block */}
            <div ref={headlineRef} className="max-w-lg">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-heading font-extrabold text-white leading-none mb-4">
                {featuredProduct.name}
              </h1>
              <p className="text-lg lg:text-xl text-white/90 mb-6">
                {featuredProduct.description}
              </p>
              <button
                ref={ctaRef}
                onClick={onScrollToCatalog}
                className="btn-primary"
              >
                Ver detalhes
              </button>
            </div>

            {/* Product Tile */}
            <div 
              ref={tileRef}
              className="bg-white rounded-[22px] p-4 shadow-card w-full max-w-[280px] lg:w-[300px]"
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3">
                <img 
                  src={featuredProduct.image} 
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-heading font-semibold text-sage-900 text-sm mb-1">
                {featuredProduct.name} 75ml
              </h3>
              <p className="text-gold-600 font-semibold mb-3">
                €{featuredProduct.price.toFixed(2)}
              </p>
              <button
                onClick={() => onAddToCart(featuredProduct)}
                className="w-full flex items-center justify-center gap-2 bg-sage-900 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-sage-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
