import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import type { CartItem } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onCheckout 
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-sage-700" />
            <h2 className="font-heading font-bold text-xl text-sage-900">
              Carrinho
            </h2>
            <span className="bg-gold-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-sage-100 transition-colors"
          >
            <X className="w-5 h-5 text-sage-700" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-sage-300 mb-4" />
              <h3 className="font-heading font-semibold text-lg text-sage-900 mb-2">
                Carrinho vazio
              </h3>
              <p className="text-sage-600">
                Adiciona produtos ao carrinho para continuar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex gap-4 p-4 bg-sage-50 rounded-2xl"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-semibold text-sage-900 text-sm mb-1 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-gold-600 font-semibold text-sm mb-3">
                      €{item.product.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-sage-200 flex items-center justify-center hover:border-gold-500 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-sage-200 flex items-center justify-center hover:border-gold-500 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemove(item.product.id)}
                        className="text-sage-400 hover:text-red-500 transition-colors text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-sage-100 bg-sage-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sage-600">Subtotal</span>
              <span className="font-heading font-bold text-xl text-sage-900">
                €{subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-sage-500 mb-4">
              Envio calculado no checkout. IVA incluído.
            </p>
            <button
              onClick={onCheckout}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              Finalizar encomenda
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
