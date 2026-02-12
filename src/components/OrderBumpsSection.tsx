import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Unlock, Gift, FileText, Video, Link as LinkIcon, Music, Loader2, CheckCircle, DollarSign, Star, Sparkles, Zap, Trophy, Crown, type LucideIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OrderBumpViewer, { OrderBumpData } from "./OrderBumpViewer";
import { useIsTabletOrMobile } from "@/hooks/use-mobile";

// Mapa de ícones disponíveis para o card de conteúdos premium
const PREMIUM_ICONS: Record<string, LucideIcon> = {
  gift: Gift,
  dollar: DollarSign,
  star: Star,
  sparkles: Sparkles,
  zap: Zap,
  trophy: Trophy,
  crown: Crown,
};

interface OrderBump {
  id: string;
  label: string;
  description?: string;
  content_url: string;
  content_type: string;
  premium_card_title?: string;
  premium_card_description?: string;
  purchase_link?: string;
  affiliate_mode?: boolean;
  premium_image_url?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  unlock_button_color?: string;
}

interface UnlockedContent {
  orderBumpId: string;
  orderBump: OrderBumpData;
}

interface OrderBumpsSectionProps {
  appId: string;
  appSlug: string;
  primaryColor: string;
  premiumIcon?: string;
  appTheme?: 'dark' | 'light';
  appTemplate?: string;
  backgroundColor?: string;
}

const STORAGE_KEY_PREFIX = "order_bump_unlocked_";

export default function OrderBumpsSection({
  appId,
  appSlug,
  primaryColor,
  premiumIcon = "gift",
  appTheme = "dark",
  appTemplate = "classic",
  backgroundColor,
}: OrderBumpsSectionProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const isTabletOrMobile = useIsTabletOrMobile();
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);
  const [unlockedContent, setUnlockedContent] = useState<Record<string, UnlockedContent>>({});
  const [loading, setLoading] = useState(true);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [selectedOrderBump, setSelectedOrderBump] = useState<OrderBump | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [viewingOrderBump, setViewingOrderBump] = useState<OrderBumpData | null>(null);

  // When the order bump viewer is open, lock background scrolling
  useEffect(() => {
    if (!viewingOrderBump) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [viewingOrderBump]);

  // Load order bumps for this app
  useEffect(() => {
    const loadOrderBumps = async () => {
      try {
        const supabaseUrl = "https://jboartixfhvifdecdufq.supabase.co";
        const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2FydGl4Zmh2aWZkZWNkdWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTc4OTgsImV4cCI6MjA3MTI3Mzg5OH0.cCa4TBR8TX9rOHy4AaKj2QRzHZIg6vc06eEkbUiHzo4";
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_public_order_bumps`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseAnonKey,
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ p_app_id: appId }),
        });

        if (!response.ok) {
          console.error("Erro ao carregar order bumps:", response.statusText);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setOrderBumps(data || []);
      } catch (error) {
        console.error("Erro ao carregar order bumps:", error);
      } finally {
        setLoading(false);
      }
    };

    if (appId) {
      loadOrderBumps();
    }
  }, [appId]);

  // Load unlocked content from localStorage
  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${appSlug}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setUnlockedContent(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar conteúdo desbloqueado:", error);
    }
  }, [appSlug]);

  const saveUnlockedContent = (content: Record<string, UnlockedContent>) => {
    const storageKey = `${STORAGE_KEY_PREFIX}${appSlug}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(content));
      setUnlockedContent(content);
    } catch (error) {
      console.error("Erro ao salvar conteúdo desbloqueado:", error);
    }
  };

  const handleUnlockClick = (orderBump: OrderBump) => {
    if (orderBump.affiliate_mode && orderBump.purchase_link) {
      window.open(orderBump.purchase_link, "_blank", "noopener,noreferrer");
      return;
    }
    setSelectedOrderBump(orderBump);
    setAccessCode("");
    setCodeDialogOpen(true);
  };

  const handleVerifyCode = async () => {
    if (!selectedOrderBump || !accessCode.trim()) return;

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-order-bump-code", {
        body: {
          code: accessCode.trim().toUpperCase(),
          orderBumpId: selectedOrderBump.id,
        },
      });

      if (error || !data?.success) {
        toast({
          title: "Código inválido",
          description: data?.message || "O código de acesso não é válido ou já foi utilizado.",
          variant: "destructive",
        });
        return;
      }

      const newUnlocked = {
        ...unlockedContent,
        [selectedOrderBump.id]: {
          orderBumpId: selectedOrderBump.id,
          orderBump: data.orderBump as OrderBumpData,
        },
      };
      saveUnlockedContent(newUnlocked);

      toast({
        title: "Conteúdo desbloqueado!",
        description: `"${selectedOrderBump.label}" foi liberado com sucesso.`,
      });

      setCodeDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao verificar código:", error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const fetchLatestOrderBump = async (orderBumpId: string) => {
    try {
      const { data, error } = await supabase
        .from("order_bumps")
        .select("*")
        .eq("id", orderBumpId)
        .single();

      if (error || !data) return null;
      return data as unknown as OrderBumpData;
    } catch (e) {
      console.error("Erro ao buscar order bump atualizado:", e);
      return null;
    }
  };

  const handleAccessContent = async (orderBumpId: string) => {
    const latest = await fetchLatestOrderBump(orderBumpId);

    if (latest) {
      const updatedUnlocked = {
        ...unlockedContent,
        [orderBumpId]: {
          orderBumpId,
          orderBump: latest,
        },
      };
      saveUnlockedContent(updatedUnlocked);
      setViewingOrderBump(latest);
      return;
    }

    const unlocked = unlockedContent[orderBumpId];
    if (unlocked?.orderBump) {
      setViewingOrderBump(unlocked.orderBump);
    } else {
      console.error("Não foi possível carregar o order bump (sem cache e sem fetch).", { orderBumpId });
    }
  };

  if (loading || orderBumps.length === 0) {
    return null;
  }

  // Renderiza o OrderBumpViewer
  const renderOrderBumpViewer = () => {
    if (!viewingOrderBump) return null;
    
    const viewerContent = (
      <div className={isTabletOrMobile ? "fixed inset-0 z-50 overflow-auto" : "absolute inset-0 z-50 overflow-auto"}>
        <OrderBumpViewer orderBump={viewingOrderBump} onClose={() => setViewingOrderBump(null)} appTemplate={appTemplate} appTheme={appTheme} />
      </div>
    );

    if (isTabletOrMobile) {
      return ReactDOM.createPortal(viewerContent, document.body);
    }
    
    return viewerContent;
  };

  if (viewingOrderBump) {
    return renderOrderBumpViewer();
  }

  const isDark = appTheme === 'dark';
  const IconComponent = PREMIUM_ICONS[premiumIcon] || Gift;

  return (
    <>
      <div 
        className="px-4 pb-6 space-y-4"
        style={{
          backgroundColor: backgroundColor || (isDark ? '#1a1a1a' : '#f3f4f6'),
        }}
      >
        {orderBumps.map((orderBump) => {
          const isUnlocked = !!unlockedContent[orderBump.id];
          const buttonColor = orderBump.unlock_button_color || '#22c55e';
          const bullets = [orderBump.bullet1, orderBump.bullet2, orderBump.bullet3].filter(Boolean);

          return (
            <div 
              key={orderBump.id}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              }}
            >
              {/* Header - Título do card */}
              <div 
                className="flex items-center gap-2.5 px-5 py-4"
                style={{
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <IconComponent className="h-5 w-5" style={{ color: primaryColor }} />
                <h3 
                  className="text-base font-bold tracking-tight"
                  style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
                >
                  {orderBump.premium_card_title || "Conteúdo Premium Exclusivo"}
                </h3>
              </div>

              {/* Body - Imagem + Info */}
              <div className="px-5 py-4">
                <div className="flex gap-4">
                  {/* Imagem do produto (se existir) */}
                  {orderBump.premium_image_url && (
                    <div className="shrink-0 w-28 h-28 rounded-xl overflow-hidden">
                      <img 
                        src={orderBump.premium_image_url} 
                        alt={orderBump.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-bold text-sm leading-tight mb-1"
                      style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
                    >
                      {orderBump.label}
                    </h4>
                    {orderBump.description && (
                      <p 
                        className="text-xs leading-relaxed mb-2.5"
                        style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)' }}
                      >
                        {orderBump.description}
                      </p>
                    )}

                    {/* Bullets */}
                    {bullets.length > 0 && (
                      <div className="space-y-1.5">
                        {bullets.map((bullet, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div 
                              className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${buttonColor}22` }}
                            >
                              <Check className="w-2.5 h-2.5" style={{ color: buttonColor }} />
                            </div>
                            <span 
                              className="text-xs"
                              style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)' }}
                            >
                              {bullet}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer - Botão */}
              <div 
                className="px-5 pb-5 pt-1"
              >
                {isUnlocked ? (
                  <button
                    onClick={() => handleAccessContent(orderBump.id)}
                    className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{ 
                      background: `linear-gradient(180deg, ${buttonColor} 0%, ${adjustColor(buttonColor, -30)} 100%)`,
                      boxShadow: `0 4px 14px ${buttonColor}40`,
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Acessar Conteúdo
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockClick(orderBump)}
                    className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{ 
                      background: `linear-gradient(180deg, ${buttonColor} 0%, ${adjustColor(buttonColor, -30)} 100%)`,
                      boxShadow: `0 4px 14px ${buttonColor}40`,
                    }}
                  >
                    <Lock className="h-4 w-4" />
                    Desbloquear agora
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog para inserir código */}
      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Desbloquear Conteúdo</DialogTitle>
            <DialogDescription>
              Digite o código de acesso que você recebeu por email após a compra.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Ex: MB-7X9K"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-wider"
              maxLength={7}
            />
            <p className="text-xs text-muted-foreground text-center mt-2">
              O código tem o formato MB-XXXX
            </p>
            {selectedOrderBump?.purchase_link && (
              <div className="text-center mt-4">
                <a
                  href={selectedOrderBump.purchase_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Ainda não comprei
                </a>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCodeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleVerifyCode}
              disabled={verifying || accessCode.length < 6}
              style={{ backgroundColor: primaryColor }}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Desbloquear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Função utilitária para escurecer/clarear cor hex
function adjustColor(hex: string, amount: number): string {
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  const num = parseInt(color, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
