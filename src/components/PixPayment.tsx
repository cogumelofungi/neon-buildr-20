import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Copy, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface PixPaymentProps {
  planName: string;
  amount: string;
  onPaymentConfirmed: () => void;
  onCancel: () => void;
}

const PixPayment = ({ planName, amount, onPaymentConfirmed, onCancel }: PixPaymentProps) => {
  const [pixCode, setPixCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "confirmed">("pending");
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const simulatedPixCode = `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.replace('R$', '')}5802BR5925MigraBook6009SAO PAULO62070503***6304`;
    setPixCode(simulatedPixCode);

    const qrCodeData = encodeURIComponent(simulatedPixCode);
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const paymentTimer = setTimeout(() => {
      setPaymentStatus("confirmed");
      toast({
        title: t("pix.payment.confirmed_title"),
        description: t("pix.payment.confirmed_desc").replace("{planName}", planName),
      });
    }, 30000);

    return () => {
      clearInterval(timer);
      clearTimeout(paymentTimer);
    };
  }, [amount, planName, toast, t]);

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast({
      title: t("pix.code_copied"),
      description: t("pix.code_copied_desc"),
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (paymentStatus === "confirmed") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            {t("pix.payment.confirmed_title")}
          </CardTitle>
          <CardDescription className="text-green-700">
            {t("pix.payment.confirmed_desc").replace("{planName}", planName)}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={onPaymentConfirmed}
            className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
          >
            {t("pix.payment.access_app")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (timeRemaining === 0) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-800">
            {t("pix.expired_title")}
          </CardTitle>
          <CardDescription className="text-red-700">
            {t("pix.expired_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onCancel} variant="outline" className="w-full">
            {t("pix.back_to_plans")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          {t("pix.payment.title")}
        </CardTitle>
        <CardDescription>
          {planName} - {amount}
        </CardDescription>
        <div className="flex items-center justify-center mt-4 p-3 bg-orange-100 rounded-lg">
          <Clock className="w-5 h-5 text-orange-600 mr-2" />
          <span className="text-orange-800 font-semibold">
            {t("pix.time_remaining")} {formatTime(timeRemaining)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code PIX" 
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("pix.scan_qrcode")}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("pix.copy_code")}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-gray-50 border rounded-lg">
              <code className="text-xs text-gray-700 break-all">
                {pixCode}
              </code>
            </div>
            <Button 
              onClick={copyPixCode}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">{t("pix.how_to_pay")}</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>{t("pix.step_1")}</li>
            <li>{t("pix.step_2")}</li>
            <li>{t("pix.step_3").replace("{amount}", amount)}</li>
            <li>{t("pix.step_4")}</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            {t("pix.cancel")}
          </Button>
          <Button 
            onClick={() => {
              setPaymentStatus("confirmed");
              toast({
                title: t("pix.simulated"),
                description: t("pix.simulated_desc"),
              });
            }}
            className="flex-1"
          >
            {t("pix.simulate")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PixPayment;
