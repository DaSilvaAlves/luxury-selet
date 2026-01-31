import { Search, User, ShoppingBag, Settings } from 'lucide-react';
import type { CartItem } from '@/types';

interface HeaderProps {
  cartItems: CartItem[];
  onCartClick: () => void;
  onLogoClick: () => void;
}

export function Header({ cartItems, onCartClick, onLogoClick }: HeaderProps) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-sage-50/80 backdrop-blur-md border-b border-sage-200/50">
      <div className="section-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button 
            onClick={onLogoClick}
            className="font-heading font-bold text-lg lg:text-xl text-sage-900 hover:text-gold-600 transition-colors"
          >
            Luxury <span className="text-gold-500">Selet</span>
          </button>

          {/* Navigation Icons */}
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              className="p-2 rounded-xl hover:bg-sage-100 transition-colors"
              aria-label="Pesquisar"
            >
              <Search className="w-5 h-5 text-sage-700" />
            </button>
            <a 
              href="#admin"
              className="p-2 rounded-xl hover:bg-sage-100 transition-colors"
              aria-label="Admin"
              title="Painel Admin"
            >
              <Settings className="w-5 h-5 text-sage-700" />
            </a>
            <button 
              className="p-2 rounded-xl hover:bg-sage-100 transition-colors"
              aria-label="Conta"
            >
              <User className="w-5 h-5 text-sage-700" />
            </button>
            <button 
              onClick={onCartClick}
              className="relative p-2 rounded-xl hover:bg-sage-100 transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingBag className="w-5 h-5 text-sage-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
