/**
 * Gera um ID de encomenda curto e pseudo-único para exibição.
 * Formato: #BOT-XXXX, onde XXXX são os últimos 4 dígitos do timestamp atual.
 * 
 * @returns {string} O ID da encomenda formatado.
 */
export const generateOrderId = (): string => {
  const prefix = 'BOT';
  // Utiliza os últimos 4 dígitos do timestamp em milissegundos.
  // Esta abordagem é simples e suficiente para evitar colisões em cenários de baixo tráfego.
  const numericPart = String(Date.now()).slice(-4);
  
  return `#${prefix}-${numericPart}`;
};