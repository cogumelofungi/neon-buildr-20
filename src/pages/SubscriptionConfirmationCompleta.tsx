import { CheckCircle2 } from "lucide-react";

const SubscriptionConfirmationCompleta = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Icon with gradient background */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#e8d5f5] via-[#d5e5f5] to-[#d5f5e8] flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-[#4285f4]" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">Acesso confirmado!</h1>

        {/* Subtitle */}
        <p className="text-lg text-[#6b7280] mb-8">
          Enviamos um e-mail com o link para você criar sua senha e acessar o painel. Verifique na sua caixa de entrada,
          se não encontrar veriifque no SPAM ou Promoções.
        </p>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 inline-block">
          <p className="text-[#6b7280] text-sm">
            Após criar sua senha, você será direcionado
            <br />
            automaticamente para o MigraBook.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionConfirmationCompleta;
