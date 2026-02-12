import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getCheckoutLink } from "@/config/stripeCheckoutLinks";

const FEATURES = [
  { bold: "Aplicativo com seu nome", text: "e identidade profissional" },
  { bold: "Conteúdo organizado", text: "e fácil de acessar pelo paciente" },
  { bold: "Atualizações simples,", text: "sem reenviar arquivos" },
  { bold: "Acesso direto pelo celular,", text: "sem depender de WhatsApp" },
  { bold: "Controle total", text: "da sua entrega, sem complicação" },
];

export const ConsultorioPlanSection = () => {
  const handleSubscribe = () => {
    const checkoutUrl = getCheckoutLink("consultorio", "monthly");
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-[#3B82F6] to-[#2563EB]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-white mb-4 leading-[1.2]">
            Plano Consultório
          </h2>
          <p className="text-[18px] sm:text-[20px] md:text-2xl text-white/90 max-w-2xl mx-auto">
            Tudo o que você precisa para <strong>transformar</strong>
            <br className="hidden md:block" /> seus materiais em um <strong>app profissional</strong>.
          </p>
        </div>

        {/* Cards Container */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4 md:p-6 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-0">
            {/* Single Card on Mobile, Split on Desktop */}
            <Card className="bg-white p-8 rounded-t-xl rounded-b-none md:rounded-l-xl md:rounded-r-none md:rounded-tr-none md:rounded-bl-xl flex flex-col items-center justify-center text-center flex-1 border-0 shadow-none">
              <div className="mb-5">
                <span className="text-4xl md:text-5xl font-bold text-gray-900">R$ 97</span>
                <span className="text-gray-600 text-xl">/mês</span>
              </div>
              <Button
                onClick={handleSubscribe}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold px-12 py-6 rounded-lg text-lg sm:text-xl md:text-2xl mb-5 w-full max-w-[320px] h-auto"
              >
                Quero Meu App
              </Button>
              <p className="text-[18px] sm:text-[20px] md:text-2xl text-gray-500">
                Sem fidelidade.
                <br />
                Você pode cancelar quando quiser.
              </p>
            </Card>

            {/* Right Card - Features */}
            <Card className="bg-white p-8 rounded-b-xl rounded-t-none md:rounded-r-xl md:rounded-l-none md:rounded-bl-none md:rounded-tr-xl flex items-center flex-1 border-0 shadow-none border-t border-gray-200 md:border-t-0 md:border-l">
              <ul className="space-y-4">
                {FEATURES.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-[#22C55E] flex-shrink-0 mt-1" />
                    <span className="text-[16px] sm:text-[18px] md:text-[22px] text-gray-700">
                      <strong className="text-gray-900">{feature.bold}</strong> {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Card>

        {/* Bottom Text */}
        <p className="text-center text-[18px] sm:text-[20px] md:text-2xl text-white/90 mt-10 max-w-4xl mx-auto leading-relaxed">
          Esse plano foi pensado para <strong>profissionais da saúde</strong> que já entregam bons conteúdos, mas querem que a forma de entrega <strong>reflita o nível</strong> do seu atendimento.
          <br className="hidden md:block" /> Sem complexidade. Sem distrações. <strong>Apenas o essencial, bem feito.</strong>
        </p>
      </div>
    </section>
  );
};

export default ConsultorioPlanSection;
