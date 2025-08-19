import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, CreditCard, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getUserSubscription } from "@/api/planService";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;
      
      try {
        const result = await getUserSubscription(user.id);
        if (result.data) {
          setSubscription(result.data);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Pagamento Aprovado!
          </h1>
          <p className="text-lg text-muted-foreground">
            Sua assinatura foi ativada com sucesso
          </p>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Plano {subscription.plan?.name}
              </CardTitle>
              <CardDescription className="text-green-700">
                {subscription.plan?.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Plan Features */}
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  Benefícios do seu plano:
                </h3>
                <ul className="space-y-2">
                  {subscription.plan?.features?.map((feature, index) => (
                    <li key={index} className="flex items-center text-green-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscription Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-green-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-green-600">Próxima cobrança</div>
                    <div className="font-semibold text-green-800">
                      {formatDate(subscription.current_period_end)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-green-600">Limite de apps</div>
                    <div className="font-semibold text-green-800">
                      {subscription.plan?.app_limit} aplicativos
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Info */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Ciclo de cobrança:</span>
                  <span className="font-semibold text-green-800">
                    {subscription.billing_cycle === 'yearly' ? 'Anual' : 'Mensal'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-green-700">Valor:</span>
                  <span className="font-semibold text-green-800">
                    {subscription.billing_cycle === 'yearly' 
                      ? formatCurrency(subscription.plan?.price_yearly || 0)
                      : formatCurrency(subscription.plan?.price_monthly || 0)
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/app')}
            className="flex-1 h-12 text-lg font-semibold"
            size="lg"
          >
            Acessar o App Builder
          </Button>
          
          <Button 
            onClick={() => navigate('/pricing')}
            variant="outline"
            className="flex-1 h-12 text-lg font-semibold"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Ver Outros Planos
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Um email de confirmação foi enviado para {user?.email}
          </p>
          <p className="mt-2">
            Você pode gerenciar sua assinatura a qualquer momento no painel do usuário
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;