import { MessageCircle, Mail, Clock, Instagram, Facebook } from 'lucide-react';

interface ContactSectionProps {
  onWhatsAppClick: () => void;
}

export function ContactSection({ onWhatsAppClick }: ContactSectionProps) {
  return (
    <section
      className="relative w-full min-h-screen flex items-center py-16"
      style={{ zIndex: 50 }}
    >
      <div className="absolute inset-0">
        <img
          src="/images/backgrounds/night_garden.jpg"
          alt="Night garden"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
      </div>

      <div className="relative w-full section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <div className="w-16 h-1 bg-gold-500 mb-6" />
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-white mb-6 leading-tight">
              Entre em<br />contacto
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-md">
              Dúvidas sobre tamanhos, stock ou envios? Fala connosco. Estamos aqui para ajudar.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/silva.lucilia.9/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.facebook.com/silva.lucilia.9"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="bg-white rounded-[26px] p-6 lg:p-8 shadow-2xl w-full max-w-md">
              <h3 className="font-heading font-bold text-xl text-sage-900 mb-6">Contactos</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sage-500 mb-1">WhatsApp</p>
                    <p className="font-medium text-sage-900">+351 961 281 939</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sage-500 mb-1">Email</p>
                    <p className="font-medium text-sage-900">sequeirasilva1967@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sage-500 mb-1">Horário</p>
                    <p className="font-medium text-sage-900">Seg–Sex, 09h–18h</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onWhatsAppClick}
                className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar mensagem
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
