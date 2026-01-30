import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, Mail, Clock, Instagram, Facebook } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ContactSectionProps {
  onWhatsAppClick: () => void;
}

export function ContactSection({ onWhatsAppClick }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const card = cardRef.current;
    const bg = bgRef.current;

    if (!section || !text || !card || !bg) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // Entrance (0-30%)
      scrollTl.fromTo(bg,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(text,
        { x: '-10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      scrollTl.fromTo(card,
        { x: '12vw', opacity: 0, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, ease: 'power2.out' },
        0.05
      );

      // Exit (70-100%)
      scrollTl.fromTo(text,
        { y: 0, opacity: 1 },
        { y: '-12vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(card,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(bg,
        { opacity: 1 },
        { opacity: 0.7, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-screen flex items-center"
      style={{ zIndex: 50 }}
    >
      {/* Background */}
      <div 
        ref={bgRef}
        className="absolute inset-0"
      >
        <img 
          src="/images/backgrounds/night_garden.jpg" 
          alt="Night garden"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/70 to-dark/40" />
      </div>

      {/* Content */}
      <div className="relative w-full section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text Block */}
          <div ref={textRef}>
            <div className="w-16 h-1 bg-gold-500 mb-6" />
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-white mb-6 leading-tight">
              Entre em<br />contacto
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-md">
              Dúvidas sobre tamanhos, stock ou envios? Fala connosco. Estamos aqui para ajudar.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Contact Card */}
          <div ref={cardRef} className="lg:justify-self-end">
            <div className="bg-white rounded-[26px] p-6 lg:p-8 shadow-2xl w-full max-w-md">
              <h3 className="font-heading font-bold text-xl text-sage-900 mb-6">
                Contactos
              </h3>

              <div className="space-y-5">
                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sage-500 mb-1">WhatsApp</p>
                    <p className="font-medium text-sage-900">+351 910 000 000</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sage-500 mb-1">Email</p>
                    <p className="font-medium text-sage-900">oi@lojaoboticario.pt</p>
                  </div>
                </div>

                {/* Hours */}
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
