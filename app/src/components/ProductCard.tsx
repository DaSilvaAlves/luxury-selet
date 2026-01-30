import React from 'react';
import type { Product } from '../hooks/useCart';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

/**
 * Badge visual para indicar o estado do stock do produto.
 * Muda de cor com base no status.
 */
const StockBadge = ({ status }: { status: Product['stockStatus'] }) => {
  const baseClasses = 'absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm';
  
  // Define as classes de cor com base no status
  const statusClasses = {
    'Pronta Entrega': 'bg-green-100 text-green-800 border border-green-200',
    'Por Encomenda': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

/**
 * Componente que representa um único produto na grelha da loja.
 */
const ProductCard = ({ product }: ProductCardProps) => {
  // Para usar o addToCart, a árvore de componentes deve estar envolvida por um CartProvider
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Impede que o clique no botão acione outros eventos
    addToCart(product);
    // Poderia adicionar um feedback visual aqui, como uma notificação.
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-xl">
      <div className="aspect-h-4 aspect-w-3 sm:aspect-none sm:h-72 relative bg-gray-100">
        <img
          src={product.image || 'https://via.placeholder.com/300'} // Imagem placeholder
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
        <StockBadge status={product.stockStatus} />
        {/* Overlay que pode ser usado para ações rápidas no hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity group-hover:bg-opacity-10" />
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-800">
            {/* O link poderia ir para uma página de detalhes do produto */}
            <a href="#" className="focus:outline-none">
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </a>
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">{product.price.toFixed(2)}€</p>
          <button
            onClick={handleAddToCart}
            className="relative rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
