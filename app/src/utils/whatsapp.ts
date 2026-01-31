import type { CartItem, CustomerData } from '@/types';

// Número WhatsApp da revendedora (Maria Lucília Silva)
const WHATSAPP_NUMBER = '351961281939';

export interface OrderDetails {
  orderId: string;
  customer: CustomerData;
  items: CartItem[];
  total: number;
  paymentMethod: string;
}

export const generateWhatsAppLink = (details: OrderDetails): string => {
  const { orderId, customer, items, total, paymentMethod } = details;

  // Lista de produtos formatada
  const productsList = items
    .map(item => `• ${item.product.name} (x${item.quantity}) — €${(item.product.price * item.quantity).toFixed(2)}`)
    .join('\n');

  // Campos opcionais
  const companyLine = customer.company ? `Empresa: ${customer.company}\n` : '';
  const nifLine = customer.nif ? `NIF: ${customer.nif}\n` : '';
  const notesLine = customer.notes ? `\n📝 *NOTAS:*\n${customer.notes}` : '';

  const message = `🛒 *NOVA ENCOMENDA ${orderId}*
━━━━━━━━━━━━━━━━━━━━━━

👤 *CLIENTE:*
Nome: ${customer.firstName} ${customer.lastName}
${companyLine}Telefone: ${customer.phone}
Email: ${customer.email}
${nifLine}
📍 *MORADA DE ENTREGA:*
${customer.address}
${customer.postalCode} ${customer.locality}
${customer.district}, ${customer.country}

📦 *PRODUTOS:*
${productsList}

━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL:* €${total.toFixed(2)}
💳 *PAGAMENTO:* ${paymentMethod}
━━━━━━━━━━━━━━━━━━━━━━${notesLine}

_Enviado via Luxury Selet_`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};