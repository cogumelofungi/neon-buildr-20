import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

export default function AcademyFloatingButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { hasWhatsAppSupport } = useFeatureAccess();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Não mostrar se não estiver logado ou se já estiver na página Academy
  if (!user || location.pathname === '/academy') {
    return null;
  }

  // Posicionar mais acima apenas se tiver botão do WhatsApp
  const positionClass = hasWhatsAppSupport ? 'bottom-20' : 'bottom-4';

  return (
    <div
      className={`fixed ${positionClass} right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Button
        onClick={() => navigate('/academy')}
        className="w-14 h-14 p-0 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-primary to-primary/80"
        title="Academy - Tutoriais"
      >
        <GraduationCap className="h-6 w-6 text-primary-foreground" />
      </Button>
    </div>
  );
}
