import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-sage-100 hover:bg-sage-200 transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-sage-700" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto">
          {/* Image */}
          <div className="w-full aspect-square md:aspect-[4/3] overflow-hidden">
            <img
              src="/lucilia.png"
              alt="Lucília Silva"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Text Content */}
          <div className="p-6 md:p-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-sage-900 mb-6 text-center">
              Quem é a Lucília Silva
            </h2>

            <div className="space-y-4 text-sage-700 leading-relaxed">
              <p>
                <span className="font-semibold text-gold-600">Luxury Select</span> nasce da paixão de Lucília Silva pelo cuidado, pela beleza e pelo bem-estar no dia a dia.
              </p>

              <p>
                Revendedora de produtos O Boticário, a Lucília acredita que cuidar de nós próprios não é um luxo — é um gesto de amor, autoestima e respeito. Cada produto selecionado reflete essa filosofia: qualidade, confiança e pequenos rituais que fazem a diferença.
              </p>

              <p>
                Aqui encontras fragrâncias, cuidados de pele e produtos de beleza escolhidos com atenção, pensados para quem valoriza sentir-se bem por dentro e por fora, todos os dias.
              </p>

              <p>
                Mais do que vender produtos, a Luxury Select oferece uma experiência próxima, personalizada e feita com carinho — porque cada pessoa é única, e o cuidado também deve ser.
              </p>

              <p className="text-center text-gold-600 font-medium pt-4 text-lg">
                ✨ Luxury Select — porque tu mereces cuidar de ti.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
