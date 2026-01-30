import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreditCard, Building2, Smartphone, Banknote, ArrowRight } from 'lucide-react';
import type { CartItem, CustomerData, PaymentMethod } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface CheckoutSectionProps {
  items: CartItem[];
  onSubmit: (data: CustomerData, paymentMethod: PaymentMethod) => void;
  id?: string;
}

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: 'cartao', label: 'Cartão', icon: CreditCard },
  { id: 'multibanco', label: 'Multibanco', icon: Building2 },
  { id: 'mbway', label: 'MB WAY', icon: Smartphone },
  { id: 'transferencia', label: 'Transferência', icon: Banknote },
];

export function CheckoutSection({ items, onSubmit, id }: CheckoutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    company: '',
    country: 'Portugal',
    address: '',
    locality: '',
    district: '',
    postalCode: '',
    phone: '',
    email: '',
    nif: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mbway');

  useEffect(() => {
    const section = sectionRef.current;
    const form = formRef.current;
    const summary = summaryRef.current;

    if (!section || !form || !summary) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(form,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      gsap.fromTo(summary,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, paymentMethod);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="py-16 lg:py-24 section-padding"
      style={{ zIndex: 30 }}
    >
      {/* Header */}
      <div className="mb-10 lg:mb-14">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading font-extrabold text-sage-900 mb-2">
          Finalizar encomenda
        </h2>
        <p className="text-sage-600 text-lg">
          Preenche os dados de envio. Receberás confirmação por email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Form */}
        <div ref={formRef} className="lg:col-span-3">
          <form id="checkout-form" onSubmit={handleSubmit} className="bg-white rounded-[26px] p-6 lg:p-8 shadow-card">
            <div className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Maria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Apelido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Silva"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Empresa <span className="text-sage-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Nome da empresa"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="Portugal">Portugal</option>
                  <option value="Espanha">Espanha</option>
                  <option value="França">França</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Morada <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Rua das Flores, 123"
                />
              </div>

              {/* Locality & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Localidade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Lisboa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Distrito <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Lisboa"
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Código Postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="1000-001"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="+351 910 000 000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="maria@email.com"
                  />
                </div>
              </div>

              {/* NIF */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  NIF <span className="text-sage-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="nif"
                  value={formData.nif}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="123456789"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Notas <span className="text-sage-400">(opcional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Instruções especiais para entrega..."
                />
              </div>

              {/* Payment Methods */}
              <div className="pt-4 border-t border-sage-100">
                <label className="block text-sm font-medium text-sage-700 mb-4">
                  Método de pagamento <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === method.id
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-sage-200 hover:border-sage-300'
                          }`}
                      >
                        <Icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-gold-600' : 'text-sage-500'
                          }`} />
                        <span className={`text-sm font-medium ${paymentMethod === method.id ? 'text-gold-700' : 'text-sage-600'
                          }`}>
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div ref={summaryRef} className="lg:col-span-2">
          <div className="bg-white rounded-[26px] p-6 lg:p-8 shadow-card sticky top-24">
            <h3 className="font-heading font-bold text-xl text-sage-900 mb-6">
              Resumo do pedido
            </h3>

            {/* Items */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-sage-100 flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sage-900 line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-sage-500">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-sage-900">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-4 border-t border-sage-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-sage-600">Subtotal</span>
                <span className="text-sage-900">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-sage-600">Envio</span>
                <span className="text-sage-500">A calcular</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-sage-100">
                <span className="font-heading font-bold text-sage-900">Total</span>
                <span className="font-heading font-bold text-xl text-gold-600">
                  €{subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              form="checkout-form"
              disabled={items.length === 0}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar para pagamento
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-sage-500 text-center mt-4">
              IVA incluído. Portes calculados pela revendedora.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
