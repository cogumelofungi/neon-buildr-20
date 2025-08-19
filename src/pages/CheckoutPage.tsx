import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CreditCardForm from "@/components/CreditCardForm";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const planParam = searchParams.get('plan');
  const billingParam = searchParams.get('billing') || 'monthly';
  const isAnnual = billingParam === 'annual';
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const plansData = {
    essencial: {
      name: "Essencial",
      monthlyPrice: 19,
      description: "Ideal para iniciantes",
      appLimit: "3 apps",
      pdfLimit: "Até 3 PDFs por app",
      planId: "032abf21-7e33-4f8f-95fd-ef5663657b77",
      features: [
        "Até 3 PDFs por app",
        "Personalização do app",
        "Suporte por email"
      ]
    },
    profissional: {
      name: "Profissional", 
      monthlyPrice: 49,
      description: "Mais flexibilidade",
      appLimit: "5 apps",
      pdfLimit: "Até 5 PDFs por app",
      planId: "7f0d0db4-e737-49be-ab41-f2003f908f9e",
      features: [
        "Até 5 PDFs por app",
        "Personalização do app",
        "Suporte por email",
        "Suporte prioritário WhatsApp",
        "Importação de apps existentes",
        "Domínio personalizado"
      ]
    },
    empresarial: {
      name: "Empresarial",
      monthlyPrice: 99,
      description: "Uso corporativo e avançado",
      appLimit: "10 apps",
      pdfLimit: "Até 8 PDFs por app",
      planId: "d5d63472-a5a6-4fec-a4e0-1abb12fe9cb7",
      features: [
        "Até 8 PDFs por app",
        "Personalização do app",
        "Suporte por email",
        "Suporte prioritário WhatsApp",
        "Importação de apps existentes",
        "Domínio personalizado",
        "Templates premium"
      ]
    }
  };

  const getDisplayPrice = (plan) => {
    if (isAnnual) {
      const annualPrice = plan.monthlyPrice * 10;
      return `R$${annualPrice}`;
    }
    return `R$${plan.monthlyPrice}`;
  };

  const getPeriod = () => {
    return isAnnual ? "/ano" : "/mês";
  };

  useEffect(() => {
    if (!planParam || !plansData[planParam]) {
      navigate('/pricing');
      return;
    }
    setSelectedPlan(plansData[planParam]);
  }, [planParam, navigate]);

  const handleStartPayment = () => {
    setShowCreditCardForm(true);
  };

  const handlePaymentConfirmed = async () => {
    if (!user || !selectedPlan) return;

    setIsProcessing(true);
    try {
      // Atualizar o plano do usuário no banco de dados
      const { error } = await supabase
        .from('user_status')
        .update({ 
          plan_id: selectedPlan.planId,
          last_renewal_date: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Plano ativado com sucesso!",
        description: `Seu plano ${selectedPlan.name} está ativo. Bem-vindo!`,
      });

      // Redirecionar para a página de sucesso
      setTimeout(() => {
        navigate('/payment-success');
      }, 2000);

    } catch (error) {
      console.error('Erro ao ativar plano:', error);
      toast({
        title: "Erro ao ativar plano",
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToPricing = () => {
    navigate('/pricing');
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showCreditCardForm) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <CreditCardForm
            planName={selectedPlan.name}
            amount={getDisplayPrice(selectedPlan)}
            planId={selectedPlan.planId}
            billing={billingParam}
            monthlyPrice={selectedPlan.monthlyPrice}
            onPaymentSuccess={handlePaymentConfirmed}
            onCancel={handleBackToPricing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Finalizar Assinatura
          </h1>
          <p className="text-lg text-muted-foreground">
            Confirme os detalhes do seu plano escolhido
          </p>
        </div>

        {/* Plan Summary Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Plano {selectedPlan.name}
            </CardTitle>
            <div className="mb-4">
              <span className="text-5xl font-bold text-primary">{getDisplayPrice(selectedPlan)}</span>
              <span className="text-xl text-muted-foreground">{getPeriod()}</span>
              {isAnnual && (
                <div className="text-sm text-muted-foreground mt-1">
                  Equivale a R${selectedPlan.monthlyPrice}/mês
                </div>
              )}
            </div>
            <CardDescription className="text-lg">{selectedPlan.description}</CardDescription>
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-xl font-semibold text-foreground">
                Publicação: {selectedPlan.appLimit}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Benefícios inclusos:
              </h3>
              <ul className="space-y-3">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-foreground">
                  Total {isAnnual ? 'anual' : 'mensal'}:
                </span>
                <span className="text-2xl font-bold text-primary">{getDisplayPrice(selectedPlan)}</span>
              </div>
              
              <Button 
                onClick={handleStartPayment}
                disabled={isProcessing}
                className="w-full h-12 text-lg font-semibold hover:scale-105 transition-all duration-300"
                size="lg"
              >
                {isProcessing ? "Processando..." : "Assinar com Cartão de Crédito"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Pricing */}
        <div className="text-center">
          <Button 
            onClick={handleBackToPricing}
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Planos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;