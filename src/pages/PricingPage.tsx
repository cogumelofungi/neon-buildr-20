import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, X, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const PricingPage = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const allFeatures = [
    "Personalização do app",
    "Suporte por email",
    "Suporte prioritário WhatsApp",
    "Importação de apps existentes",
    "Domínio personalizado",
    "Templates premium"
  ];

  const plans = [
    {
      name: "Essencial",
      monthlyPrice: 19,
      description: "Ideal para iniciantes",
      appLimit: "3 aplicativos",
      pdfLimit: "Até 3 PDFs por app",
      features: {
        "Personalização do app": true,
        "Suporte por email": true,
        "Suporte prioritário WhatsApp": false,
        "Importação de apps existentes": false,
        "Domínio personalizado": false,
        "Templates premium": false
      },
      planId: "essencial",
      highlight: false,
      badge: "7 dias grátis"
    },
    {
      name: "Profissional",
      monthlyPrice: 49,
      description: "Mais flexibilidade",
      appLimit: "5 aplicativos",
      pdfLimit: "Até 5 PDFs por app",
      features: {
        "Personalização do app": true,
        "Suporte por email": true,
        "Suporte prioritário WhatsApp": true,
        "Importação de apps existentes": true,
        "Domínio personalizado": true,
        "Templates premium": false
      },
      planId: "profissional",
      highlight: true
    },
    {
      name: "Empresarial",
      monthlyPrice: 99,
      description: "Uso corporativo e avançado",
      appLimit: "10 aplicativos",
      pdfLimit: "Até 8 PDFs por app",
      features: {
        "Personalização do app": true,
        "Suporte por email": true,
        "Suporte prioritário WhatsApp": true,
        "Importação de apps existentes": true,
        "Domínio personalizado": true,
        "Templates premium": true
      },
      planId: "empresarial",
      highlight: false
    }
  ];

  const getPrice = (plan: any) => {
    if (isAnnual) {
      const annualPrice = plan.monthlyPrice * 10;
      return `R$${annualPrice}`;
    }
    return `R$${plan.monthlyPrice}`;
  };

  const getPeriod = () => {
    return isAnnual ? "/ano" : "/mês";
  };

  const handleSubscribe = (planId: string) => {
    const billing = isAnnual ? 'annual' : 'monthly';
    navigate(`/checkout?plan=${planId}&billing=${billing}`);
  };

  const handleBackToApp = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Planos e Preços
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Compare os planos e escolha a melhor opção para você publicar seus apps.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Label htmlFor="billing-toggle" className={`text-lg ${!isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Mensal
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="billing-toggle" className={`text-lg ${isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Anual
            </Label>
            {isAnnual && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                2 meses grátis
              </Badge>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.highlight 
                  ? 'ring-2 ring-primary scale-105 shadow-xl border-primary/50' 
                  : 'hover:shadow-lg'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Mais Popular
                  </span>
                </div>
              )}
              
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl font-bold text-foreground mb-2">{plan.name}</CardTitle>
                 <div className="mb-4">
                   <span className="text-4xl font-bold text-primary">{getPrice(plan)}</span>
                   <span className="text-muted-foreground">{getPeriod()}</span>
                   {isAnnual && (
                     <div className="text-sm text-muted-foreground mt-1">
                       Equivale a R${plan.monthlyPrice}/mês
                     </div>
                   )}
                 </div>
                <CardDescription className="text-lg">{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">{plan.appLimit}</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">{plan.pdfLimit}</span>
                  </li>
                  {allFeatures.map((feature) => (
                  <li key={feature} className="flex items-center">
                      {plan.features[feature] ? (
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${plan.features[feature] ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {feature}
                      </span>
                  </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan.planId)}
                  className={`w-full transition-all duration-300 ${
                    plan.highlight 
                      ? 'h-12 text-lg font-semibold hover:scale-105' 
                      : 'h-11'
                  }`}
                  size="lg"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  Assinar {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;