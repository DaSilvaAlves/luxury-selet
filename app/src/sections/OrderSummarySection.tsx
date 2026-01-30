import { Check, MessageCircle, ArrowLeft } from 'lucide-react';
import type { CartItem, CustomerData, PaymentMethod } from '@/types';

interface OrderSummarySectionProps {
  id?: string;
  items: CartItem[];
  customer: CustomerData;
  paymentMethod: PaymentMethod;
  onConfirm: () => void;
  onBack: () => void;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cartao: 'Cartão',
  multibanco: 'Multibanco',
  mbway: 'MB WAY',
  transferencia: 'Transferência',
};

export function OrderSummarySection({
  id,
  items,
  customer,
  paymentMethod,
  onConfirm,
  onBack
}: OrderSummarySectionProps) {
  // Verificação de segurança
  if (!customer || !items || items.length === 0) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <section
      id={id}
      className="py-16 lg:py-24 section-padding bg-sage-50"
    >
      <div className="max-w-2xl mx-auto">
        {/* Summary Card */}
        <div className="bg-white rounded-[28px] shadow-2xl p-6 lg:p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-gold-600" />
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-heading font-bold text-sage-900 text-center mb-2">
            Resumo da encomenda
          </h2>
          <p className="text-sage-600 text-center mb-6">
            Revisa os detalhes antes de confirmar
          </p>

          {/* Items */}
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto bg-sage-50 rounded-xl p-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-sage-500">x{item.quantity}</span>
                  <span className="text-sm text-sage-900">{item.product.name}</span>
                </div>
                <span className="text-sm font-medium text-sage-900">
                  €{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Customer Info */}
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-sage-500">Cliente</span>
              <span className="text-sage-900">{customer.firstName} {customer.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sage-500">Telefone</span>
              <span className="text-sage-900">{customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sage-500">Pagamento</span>
              <span className="text-sage-900">{paymentMethodLabels[paymentMethod]}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t border-sage-100 mb-6">
            <span className="font-heading font-bold text-sage-900">Total</span>
            <span className="font-heading font-bold text-2xl text-gold-600">
              €{subtotal.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar por WhatsApp
            </button>
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 py-3 text-sage-600 hover:text-sage-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao checkout
            </button>
          </div>

          <p className="text-xs text-sage-500 text-center mt-4">
            A revendedora confirmará o valor total com portes via WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
