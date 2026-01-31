import { Plus } from 'lucide-react';
import type { Product } from '@/types';

interface HeroSectionProps {
  featuredProduct: Product;
  onAddToCart: (product: Product) => void;
  onScrollToCatalog: () => void;
}

export function HeroSection({ featuredProduct, onAddToCart, onScrollToCatalog }: HeroSectionProps) {
  return (
    <section
      className="relative w-full h-screen flex items-center justify-center pt-20"
      style={{ zIndex: 10 }}
    >
      <div className="relative w-[92vw] h-[80vh] rounded-[28px] overflow-hidden shadow-card">
        <img
          src="/images/backgrounds/hero_botanical.jpg"
          alt="Botanical background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />

        <div className="absolute inset-0 p-6 lg:p-12 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="label-mono text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              NOVIDADE
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-lg">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-heading font-extrabold text-white leading-none mb-4">
                {featuredProduct.name}
              </h1>
              <p className="text-lg lg:text-xl text-white/90 mb-6">
                {featuredProduct.description}
              </p>
              <button
                onClick={onScrollToCatalog}
                className="btn-primary"
              >
                Ver detalhes
              </button>
            </div>

            <div className="bg-white rounded-[22px] p-4 shadow-card w-full max-w-[280px] lg:w-[300px]">
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
                className="w-full flex items-center justify-center gap-2 bg-gold-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-gold-600 transition-all duration-300 hover:shadow-lg"
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
