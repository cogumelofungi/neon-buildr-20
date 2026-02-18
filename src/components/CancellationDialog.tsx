import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Heart, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel: (reason: string, feedback: string) => Promise<void>;
  onReactivate: () => void;
  isCancelling: boolean;
  subscriptionEnd?: string | null;
  isCancelled?: boolean;
}

const CANCELLATION_REASONS = [
  { value: "not_using", key: "cancellation.reason.not_using" },
  { value: "pause_project", key: "cancellation.reason.pause_project" },
  { value: "project_finished", key: "cancellation.reason.project_finished" },
  { value: "too_expensive", key: "cancellation.reason.too_expensive" },
  { value: "not_adapted", key: "cancellation.reason.not_adapted" },
  { value: "other", key: "cancellation.reason.other" },
];

export const CancellationDialog = ({
  open,
  onOpenChange,
  onConfirmCancel,
  onReactivate,
  isCancelling,
  subscriptionEnd,
  isCancelled = false,
}: CancellationDialogProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(isCancelled ? 3 : 1);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setStep(isCancelled ? 3 : 1);
      setSelectedReason("");
      setFeedback("");
    }
    onOpenChange(open);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      handleConfirmCancel();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await onConfirmCancel(selectedReason, feedback);
      // Só avança para step 3 se o cancelamento foi bem-sucedido
      setStep(3);
    } catch (error) {
      // Se falhou, permanece no step atual (não mostra confirmação falsa)
      console.error("Cancelamento falhou:", error);
    }
  };

  const handleReactivate = () => {
    onReactivate();
    handleOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Step 1: Motivo do Cancelamento */}
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>{t("cancellation.step1.title")}</DialogTitle>
              <DialogDescription>
                {t("cancellation.step1.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">{t("cancellation.reason.label")}</Label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder={t("cancellation.reason.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCELLATION_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {t(reason.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">{t("cancellation.feedback.label")}</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t("cancellation.feedback.placeholder")}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedReason || !feedback.trim()}
                className="gap-1"
              >
                {t("common.continue")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Mensagem de Retenção - Última etapa antes do cancelamento */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Antes de ir, leia isso...
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Sua conta continua ativa até o final do período atual.
              </p>
              
              <p className="text-sm text-muted-foreground">
                E, se você tiver alguma dúvida ou dificuldade, a gente pode te ajudar.
              </p>
              
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Mantendo sua assinatura, você:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    Mantém o histórico de todos os apps que já criou
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    Continua recebendo atualizações e novos recursos (AI e chatbot em breve)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    Segue entregando seu conteúdo como aplicativo, com mais valor percebido e menos suporte do que um PDF
                  </li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground font-medium">
                Cancelar agora significa voltar para o modelo antigo de entrega.
              </p>

              <p className="text-sm text-foreground font-medium">
                O que você prefere fazer?
              </p>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="default"
                onClick={() => handleOpenChange(false)}
                className="flex-1"
              >
                Continuar com o MigraBook
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1"
              >
                {isCancelling ? t("profile.canceling") : "Cancelar assinatura"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Cancelamento Confirmado + Reativação */}
        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                {t("cancellation.step3.title")}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t("cancellation.step3.access_until")}
                </p>
                {subscriptionEnd && (
                  <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mt-1">
                    {formatDate(subscriptionEnd)}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {t("cancellation.step3.reactivate_message")}
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1"
              >
                {t("common.close")}
              </Button>
              <Button
                onClick={handleReactivate}
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {t("cancellation.step3.reactivate_button")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
