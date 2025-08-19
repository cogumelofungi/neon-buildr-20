import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStatus } from "@/hooks/useUserStatus";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CreditCard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InactiveAccount = () => {
  const { cancellationMessage } = useUserStatus();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleGoToPricing = () => {
    navigate('/pricing');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Conta Inativa</CardTitle>
          <CardDescription>
            Sua conta foi desativada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {cancellationMessage || "Sua conta foi desativada. Entre em contato com o suporte para mais informações."}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleGoToPricing} 
              className="w-full"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Assinar Plano para Reativar Conta
            </Button>
            
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Fazer Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InactiveAccount;