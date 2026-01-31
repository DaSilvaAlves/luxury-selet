import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import type { Product, Category } from '@/types';

interface CatalogSectionProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
  id?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flip-card-container h-[420px] sm:h-[450px]"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`flip-card-inner relative w-full h-full transition-transform duration-500`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front Side - Product Image & Info */}
        <div
          className="flip-card-front absolute inset-0 bg-white rounded-2xl overflow-hidden shadow-card flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Image - taps to flip */}
          <div
            className="relative h-[55%] overflow-hidden bg-sage-100 cursor-pointer"
            onClick={() => setIsFlipped(true)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Info hint */}
            {product.description && (
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-sage-600 shadow-sm">
                Ver detalhes
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-semibold text-sage-900 text-sm leading-tight line-clamp-2 mb-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-gold-600 font-bold text-lg">
                  €{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sage-400 line-through text-sm">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gold-500 text-white py-2.5 rounded-xl font-medium hover:bg-gold-600 transition-all duration-300 active:scale-[0.98] mt-3"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Back Side - Description */}
        <div
          className="flip-card-back absolute inset-0 bg-gradient-to-b from-sage-800 to-sage-900 rounded-2xl overflow-hidden shadow-card flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Header with back button */}
          <div className="p-4 pb-2 flex items-center justify-between border-b border-sage-700">
            <h3 className="font-heading font-bold text-white text-base line-clamp-1 flex-1 pr-2">
              {product.name}
            </h3>
            <button
              onClick={() => setIsFlipped(false)}
              className="p-2 bg-sage-700 hover:bg-sage-600 rounded-full transition-colors flex-shrink-0"
              aria-label="Voltar"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Description */}
          <div className="flex-1 p-4 overflow-y-auto">
            {product.description ? (
              <p className="text-sage-200 text-sm leading-relaxed">
                {product.description}
              </p>
            ) : (
              <p className="text-sage-400 text-sm italic text-center">
                Descrição em breve disponível.
              </p>
            )}
          </div>

          {/* Price footer */}
          <div className="p-4 pt-2 border-t border-sage-700">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gold-400 font-bold text-xl">
                €{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sage-400 line-through text-sm">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CatalogSection({ products, categories, onAddToCart, id }: CatalogSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter active categories that have products
  const activeCategories = categories.filter(cat =>
    cat.isActive && products.some(p => p.categoryId === cat.id)
  );

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.categoryId === selectedCategory);

  return (
    <section
      id={id}
      className="py-16 lg:py-24 section-padding"
      style={{ zIndex: 20 }}
    >
      {/* Header */}
      <div className="text-center mb-10 lg:mb-14">
        <span className="label-mono text-gold-600 mb-3 block">O NOSSO CATÁLOGO</span>
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading font-extrabold text-sage-900 mb-6">
          Produtos Selecionados
        </h2>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
              selectedCategory === 'all'
                ? 'bg-sage-900 text-white'
                : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
            }`}
          >
            Todos
          </button>
          {activeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                selectedCategory === category.id
                  ? 'bg-sage-900 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-sage-500 text-lg">
            Em breve teremos produtos disponíveis.
          </p>
        </div>
      )}
    </section>
  );
}
