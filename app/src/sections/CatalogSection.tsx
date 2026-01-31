import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Product, Category } from '@/types';

interface CatalogSectionProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
  id?: string;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="product-card card-product group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="aspect-[3/4] overflow-hidden bg-sage-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <h3 className="font-heading font-semibold text-sage-900 mb-2 line-clamp-2 min-h-[3rem]">
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
            Em breve teremos produtos disponíveis.
          </p>
        </div>
      )}
    </section>
  );
}
