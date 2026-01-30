import React from 'react';
import { useCart } from '../../hooks/useCart';
import type { CartItem } from '../../hooks/useCart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Ícones SVG para evitar dependências ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Componente para uma linha de item no carrinho ---
const CartItemRow = ({ item }: { item: CartItem }) => {
    const { updateQuantity, removeFromCart } = useCart();
    return (
        <li className="flex py-6">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="h-full w-full object-cover object-center" />
            </div>
            <div className="ml-4 flex flex-1 flex-col">
                <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">{(item.price * item.quantity).toFixed(2)}€</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{item.stockStatus}</p>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center border border-gray-200 rounded">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">-</button>
                        <p className="w-8 text-center text-gray-700"> {item.quantity}</p>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">+</button>
                    </div>
                    <div className="flex">
                        <button type="button" onClick={() => removeFromCart(item.id)} className="font-medium text-indigo-600 hover:text-indigo-500">
                            Remover
                        </button>
                    </div>
                </div>
            </div>
        </li>
    );
}

/**
 * Componente principal do painel de carrinho deslizante (Drawer).
 */
const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { cart, total, totalItems } = useCart();

  return (
    <div className={`relative z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Overlay de Fundo */}
      <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      
      {/* Painel Deslizante */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`pointer-events-auto fixed inset-y-0 right-0 flex max-w-full pl-10 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex h-full w-screen max-w-md flex-col overflow-y-scroll bg-white shadow-xl">
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900" id="slide-over-title">Carrinho ({totalItems})</h2>
                  <div className="ml-3 flex h-7 items-center">
                    <button type="button" className="-m-2 p-2 text-gray-400 hover:text-gray-500" onClick={onClose}>
                      <span className="sr-only">Fechar painel</span>
                      <CloseIcon />
                    </button>
                  </div>
                </div>
                <div className="mt-8">
                    {cart.length > 0 ? (
                      <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {cart.map((item) => <CartItemRow key={item.id} item={item} />)}
                      </ul>
                    ) : (
                      <p className="py-10 text-center text-gray-500">O seu carrinho está vazio.</p>
                    )}
                </div>
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>{total.toFixed(2)}€</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">O valor final não inclui portes de envio.</p>
                  <div className="mt-6">
                    <a href="#" // TODO: Mudar para o link da página de checkout
                      className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700">
                      Finalizar Encomenda
                    </a>
                  </div>
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>ou{' '}
                      <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500" onClick={onClose}>
                        Continuar a Comprar
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
