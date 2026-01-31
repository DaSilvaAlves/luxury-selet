import { Plus, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';

interface CatalogSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  id?: string;
}

export function CatalogSection({ title, subtitle, products, onAddToCart, id }: CatalogSectionProps) {
  return (
    <section
      id={id}
      className="py-16 lg:py-24 section-padding"
      style={{ zIndex: 20 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 lg:mb-14">
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

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card card-product group"
            >
              <div className="aspect-[3/4] overflow-hidden bg-sage-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

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
                  className="w-full flex items-center justify-center gap-2 bg-gold-500 text-white py-3 rounded-xl font-medium hover:bg-gold-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-sage-500 text-lg">
            Em breve teremos produtos disponíveis nesta categoria.
          </p>
        </div>
      )}
    </section>
  );
}
