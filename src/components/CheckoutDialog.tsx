import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, CreditCard, Banknote, QrCode, MapPin, Store } from 'lucide-react';
import { CartItem } from '@/contexts/CartContext';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  total: number;
  onConfirm: (data: CheckoutData) => void;
}

export interface CheckoutData {
  paymentMethod: string;
  deliveryType: 'delivery' | 'pickup';
  address: string;
  deliveryFee: number;
  observation: string;
}

const DELIVERY_FEE = 5.0;

const CheckoutDialog = ({ open, onOpenChange, items, total, onConfirm }: CheckoutDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup' | ''>('');
  const [address, setAddress] = useState('');
  const [observation, setObservation] = useState('');

  const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const finalTotal = total + deliveryFee;

  const isValid = paymentMethod && deliveryType && (deliveryType === 'pickup' || address.trim());

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({
      paymentMethod,
      deliveryType: deliveryType as 'delivery' | 'pickup',
      address: address.trim(),
      deliveryFee,
      observation: observation.trim(),
    });
  };

  const paymentOptions = [
    { value: 'cartao', label: 'Cartão', icon: CreditCard },
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'pix', label: 'PIX', icon: QrCode },
  ];

  const paymentEmoji: Record<string, string> = {
    cartao: '💳 Cartão',
    dinheiro: '💵 Dinheiro',
    pix: '📱 PIX',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Finalizar Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Forma de Pagamento
            </Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-2">
              {paymentOptions.map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`pay-${opt.value}`}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === opt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} className="sr-only" />
                  <opt.icon className={`w-5 h-5 ${paymentMethod === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium ${paymentMethod === opt.value ? 'text-primary' : 'text-muted-foreground'}`}>
                    {opt.label}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Delivery Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Tipo de Entrega
            </Label>
            <RadioGroup value={deliveryType} onValueChange={(v) => setDeliveryType(v as 'delivery' | 'pickup')} className="grid grid-cols-2 gap-3">
              <Label
                htmlFor="delivery-delivery"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  deliveryType === 'delivery'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <RadioGroupItem value="delivery" id="delivery-delivery" className="sr-only" />
                <MapPin className={`w-5 h-5 ${deliveryType === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-sm font-medium ${deliveryType === 'delivery' ? 'text-primary' : 'text-foreground'}`}>
                    Delivery
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Taxa: {formatPrice(DELIVERY_FEE)}
                  </p>
                </div>
              </Label>
              <Label
                htmlFor="delivery-pickup"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  deliveryType === 'pickup'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <RadioGroupItem value="pickup" id="delivery-pickup" className="sr-only" />
                <Store className={`w-5 h-5 ${deliveryType === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-sm font-medium ${deliveryType === 'pickup' ? 'text-primary' : 'text-foreground'}`}>
                    Retirada
                  </p>
                  <p className="text-xs text-muted-foreground">Sem taxa</p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {/* Address (only for delivery) */}
          {deliveryType === 'delivery' && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="address" className="text-sm font-semibold text-foreground">
                Endereço de Entrega
              </Label>
              <Textarea
                id="address"
                placeholder="Rua, Nº, Complemento, Bairro, Cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="resize-none bg-background border-border"
                rows={2}
              />
            </div>
          )}

          {/* Observation */}
          <div className="space-y-2">
            <Label htmlFor="obs" className="text-sm font-semibold text-foreground">
              Observação <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="obs"
              placeholder="Ex: Sem cebola, troco para R$50..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="resize-none bg-background border-border"
              rows={2}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            {deliveryType === 'delivery' && (
              <>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxa de entrega</span>
                  <span>{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Previsão de entrega</span>
                  <span>~50 min</span>
                </div>
              </>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full gradient-burger text-primary-foreground py-6 rounded-xl font-bold text-lg gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Enviar pelo WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CheckoutDialog, type CheckoutDialogProps };
export default CheckoutDialog;
