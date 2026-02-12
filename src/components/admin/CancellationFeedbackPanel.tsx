import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

interface CancellationFeedback {
  id: string;
  user_id: string;
  user_email: string | null;
  reason: string;
  feedback: string;
  created_at: string;
}

const REASON_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  not_using: { label: "Não está usando", variant: "secondary" },
  pause_project: { label: "Pausar projeto", variant: "outline" },
  project_finished: { label: "Projeto finalizado", variant: "default" },
  too_expensive: { label: "Muito caro", variant: "destructive" },
  not_adapted: { label: "Não se adaptou", variant: "destructive" },
  other: { label: "Outro", variant: "outline" },
};

const CancellationFeedbackPanel = () => {
  const { t } = useLanguage();
  const [feedbacks, setFeedbacks] = useState<CancellationFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("cancellation_feedback" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Erro ao buscar feedbacks:", fetchError);
        setError("Erro ao carregar feedbacks de cancelamento");
        return;
      }

      setFeedbacks((data as unknown as CancellationFeedback[]) || []);
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao carregar feedbacks");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReasonBadge = (reason: string) => {
    const config = REASON_LABELS[reason] || { label: reason, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedbacks de Cancelamento
        </CardTitle>
        <CardDescription>
          Visualize os feedbacks deixados por usuários ao cancelar suas assinaturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum feedback de cancelamento registrado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Data</TableHead>
                  <TableHead className="w-[200px]">Email</TableHead>
                  <TableHead className="w-[150px]">Motivo</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium text-sm">
                      {formatDate(feedback.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {feedback.user_email || "—"}
                    </TableCell>
                    <TableCell>
                      {getReasonBadge(feedback.reason)}
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {feedback.feedback}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          Total: {feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  );
};

export default CancellationFeedbackPanel;
