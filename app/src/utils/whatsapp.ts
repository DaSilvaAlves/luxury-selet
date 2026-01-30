import { CartItem } from '../hooks/useCart';

export const generateWhatsAppLink = (details: {
  orderId: string;
  customer: any;
  items: CartItem[];
  total: number;
  paymentMethod: string;
}) => {
  const WHATSAPP_NUMBER = '351961281939';

  const productsList = details.items
    .map(item => `• ${item.quantity}x ${item.product.name} (${item.product.price.toFixed(2)}€)`)
    .join('\n');

  const message = `👋 *NOVA ENCOMENDA ${details.orderId}*

👤 *CLIENTE:*
Nome: ${details.customer.firstName} ${details.customer.lastName}
Tel: ${details.customer.phone}
📍 ${details.customer.address}, ${details.customer.locality} (${details.customer.postalCode})

📦 *PRODUTOS:*
${productsList}

💰 *TOTAL:* ${details.total.toFixed(2)}€
💳 *PAGAMENTO:* ${details.paymentMethod}

_Enviado via Catálogo Interativo_`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};