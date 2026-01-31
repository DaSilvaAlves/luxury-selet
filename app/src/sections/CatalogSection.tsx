import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Product, Category } from '@/types';

interface CatalogSectionProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
  id?: string;
}

interface FlipCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function FlipCard({ product, onAddToCart }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="flip-card-container aspect-[3/5]"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`flip-card-inner relative w-full h-full transition-transform duration-500 cursor-pointer`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
        onClick={handleClick}
      >
        {/* Front Side - Product Image & Info */}
        <div
          className="flip-card-front absolute inset-0 bg-white rounded-2xl overflow-hidden shadow-card"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-[70%] overflow-hidden bg-sage-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="h-[30%] p-4 flex flex-col justify-between">
            <h3 className="font-heading font-semibold text-sage-900 text-sm line-clamp-2">
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

          {/* Hint to flip */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-sage-600 shadow-sm">
            Toque para ver mais
          </div>
        </div>

        {/* Back Side - Description */}
        <div
          className="flip-card-back absolute inset-0 bg-gradient-to-b from-sage-800 to-sage-900 rounded-2xl overflow-hidden shadow-card p-6 flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <h3 className="font-heading font-bold text-white text-xl mb-4 text-center">
            {product.name}
          </h3>

          <div className="flex-1 overflow-y-auto">
            {product.description ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sage-200 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sage-300 text-sm italic text-center">
                Descrição em breve disponível.
              </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-sage-700">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-gold-400 font-bold text-2xl">
                €{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sage-400 line-through text-sm">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gold-500 text-white py-3 rounded-xl font-medium hover:bg-gold-600 transition-all duration-300 active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              Adicionar ao Carrinho
            </button>
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <FlipCard
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
