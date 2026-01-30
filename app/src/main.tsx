import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './hooks/useCart.tsx' // Importação do CartProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider> {/* Envolve a aplicação com o CartProvider */}
      <App />
    </CartProvider>
  </StrictMode>,
)
