import { useState } from 'react';
import { Send, Instagram, Facebook, Heart } from 'lucide-react';

export function FooterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="py-12 lg:py-16 section-padding bg-sage-50 border-t border-sage-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-10">
          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-bold text-2xl text-sage-900 mb-3">
              Recebe novidades
            </h3>
            <p className="text-sage-600 mb-6">
              Subscreve a nossa newsletter para receber as últimas novidades e promoções exclusivas.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O teu email"
                className="flex-1 input-field"
                required
              />
              <button
                type="submit"
                className="btn-primary flex items-center gap-2 px-4"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Subscrever</span>
              </button>
            </form>
            {subscribed && (
              <p className="text-green-600 text-sm mt-3">
                Obrigado pela subscrição!
              </p>
            )}
          </div>

          {/* Links */}
          <div className="lg:text-right">
            <h3 className="font-heading font-bold text-lg text-sage-900 mb-4">
              Links úteis
            </h3>
            <div className="flex flex-wrap lg:justify-end gap-4 lg:gap-6 mb-6">
              <a href="https://www.instagram.com/silva.lucilia.9/" target="_blank" rel="noopener noreferrer" className="text-sage-600 hover:text-gold-600 transition-colors">
                Instagram
              </a>
              <a href="https://www.facebook.com/silva.lucilia.9" target="_blank" rel="noopener noreferrer" className="text-sage-600 hover:text-gold-600 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-sage-600 hover:text-gold-600 transition-colors">
                Termos
              </a>
              <a href="#" className="text-sage-600 hover:text-gold-600 transition-colors">
                Privacidade
              </a>
            </div>
            <div className="flex lg:justify-end gap-3">
              <a
                href="https://www.instagram.com/silva.lucilia.9/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center hover:bg-gold-100 transition-colors"
              >
                <Instagram className="w-4 h-4 text-sage-600" />
              </a>
              <a
                href="https://www.facebook.com/silva.lucilia.9"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center hover:bg-gold-100 transition-colors"
              >
                <Facebook className="w-4 h-4 text-sage-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-sage-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-sage-500">
            © 2026 Luxury Selet. Todos os direitos reservados.
          </p>
          <p className="text-sm text-sage-500 flex items-center gap-1">
            Feito com <Heart className="w-4 h-4 text-red-400 fill-red-400" /> em Portugal
          </p>
        </div>
      </div>
    </footer>
  );
}
