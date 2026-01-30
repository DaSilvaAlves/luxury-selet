import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { generateOrderId } from '../../utils/orderId';
import { generateWhatsAppLink } from '../../utils/whatsapp';
import type { CustomerData, ShippingData } from '../../utils/whatsapp';

// --- Estado inicial para o formulário ---
const initialFormData: CustomerData & { shipping: ShippingData, notes: string } = {
    name: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    notes: '',
    shipping: {
        name: '',
        address: '',
        postalCode: '',
        city: '',
    },
};

const CheckoutForm = () => {
    const { cart, total, clearCart } = useCart();
    const [formData, setFormData] = useState(initialFormData);
    const [isDropShipping, setIsDropShipping] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('MB WAY');
    const [rgpdAccepted, setRgpdAccepted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, dataset } = e.target;
        
        if (dataset.section === 'shipping') {
            setFormData(prev => ({ ...prev, shipping: { ...prev.shipping, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!rgpdAccepted || cart.length === 0) {
            alert('Por favor, aceite os termos de RGPD e certifique-se que o carrinho não está vazio.');
            return;
        }

        const orderId = generateOrderId();
        const finalShippingData = isDropShipping ? formData.shipping : undefined;

        const orderDetails = {
            orderId,
            customer: {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                postalCode: formData.postalCode,
                city: formData.city,
            },
            isDropShipping,
            shipping: finalShippingData,
            cart,
            total,
            paymentMethod,
            notes: formData.notes,
        };

        const whatsappLink = generateWhatsAppLink(orderDetails);

        // Limpa o carrinho após gerar o link
        clearCart();

        // Redireciona o utilizador para o WhatsApp
        window.location.href = whatsappLink;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8">
                {/* --- Secção 1: Dados do Cliente --- */}
                <fieldset>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">1. Dados de Contacto e Faturação</h3>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        {/* Outros campos de cliente: phone, email, address, etc. */}
                    </div>
                </fieldset>

                {/* --- Secção 2: Morada de Entrega --- */}
                <fieldset className="pt-8">
                    <h3 className="text-lg font-medium text-gray-900">2. Morada de Entrega</h3>
                    <div className="mt-6">
                        <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input id="drop-shipping" name="drop-shipping" type="checkbox" checked={isDropShipping} onChange={(e) => setIsDropShipping(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600"/>
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="drop-shipping" className="font-medium text-gray-700">Enviar para uma morada diferente (Drop Shipping)</label>
                                <p className="text-gray-500">Selecione se a encomenda não é para si.</p>
                            </div>
                        </div>
                    </div>

                    {isDropShipping && (
                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <h4 className="sm:col-span-6 text-base font-medium text-gray-800">Dados para Envio Final</h4>
                            <div className="sm:col-span-3">
                                <label htmlFor="shipping-name" className="block text-sm font-medium text-gray-700">Nome do Destinatário</label>
                                <input type="text" name="name" id="shipping-name" data-section="shipping" required={isDropShipping} value={formData.shipping.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                            </div>
                           {/* Outros campos de shipping: address, etc. */}
                        </div>
                    )}
                </fieldset>

                {/* --- Secção 3: Pagamento e Notas --- */}
                <fieldset className="pt-8">
                    <h3 className="text-lg font-medium text-gray-900">3. Pagamento e Notas</h3>
                    {/* ... campos para pagamento e notas ... */}
                </fieldset>

                {/* --- Secção 4: Finalizar --- */}
                <div className="pt-8">
                     <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                            <input id="rgpd" name="rgpd" type="checkbox" required checked={rgpdAccepted} onChange={(e) => setRgpdAccepted(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600"/>
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="rgpd" className="font-medium text-gray-700">Consentimento de Dados (RGPD)</label>
                            <p className="text-gray-500">Aceito que os meus dados sejam processados para fins desta encomenda.</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button type="submit" disabled={!rgpdAccepted || cart.length === 0} className="w-full rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400">
                            Finalizar e Enviar Pedido via WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CheckoutForm;
