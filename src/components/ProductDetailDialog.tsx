import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { Minus, Plus, X, Image as ImageIcon, Gift } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_popular: boolean;
  category_id: string;
  categories?: { name: string; slug: string; icon: string } | null;
}

interface UpsellOffer {
  id: string;
  upsell_product_id: string;
  extra_price: number;
  label: string;
  upsell_product?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
}

interface ProductDetailDialogProps {
  item: ProductItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailDialog = ({ item, open, onOpenChange }: ProductDetailDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [upsells, setUpsells] = useState<UpsellOffer[]>([]);
  const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set());
  const { addItem } = useCart();

  useEffect(() => {
    if (open && item.id) {
      fetchUpsells();
      setSelectedUpsells(new Set());
      setQuantity(1);
    }
  }, [open, item.id]);

  const fetchUpsells = async () => {
    const { data } = await supabase
      .from('product_upsells')
      .select('id, upsell_product_id, extra_price, label')
      .eq('product_id', item.id)
      .eq('is_active', true)
      .order('sort_order');

    if (data && data.length > 0) {
      // Fetch upsell product details
      const upsellIds = data.map(u => u.upsell_product_id);
      const { data: upsellProducts } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .in('id', upsellIds);

      const enriched = data.map(u => ({
        ...u,
        upsell_product: upsellProducts?.find(p => p.id === u.upsell_product_id),
      }));
      setUpsells(enriched);
    } else {
      setUpsells([]);
    }
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const toggleUpsell = (id: string) => {
    setSelectedUpsells(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const upsellTotal = upsells
    .filter(u => selectedUpsells.has(u.id))
    .reduce((sum, u) => sum + Number(u.extra_price), 0);

  const total = (Number(item.price) + upsellTotal) * quantity;
  const categorySlug = item.categories?.slug;

  const handleAddToCart = () => {
    // Add main item
    addItem({
      id: `${item.id}-${Date.now()}`,
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        image: item.image_url || '',
        category: (categorySlug as 'hamburgueres' | 'acai' | 'bebidas') || 'hamburgueres',
      },
      quantity,
      addBatata: false,
      bebida: null,
      totalPrice: Number(item.price) * quantity,
    });

    // Add selected upsells as separate cart items
    upsells
      .filter(u => selectedUpsells.has(u.id) && u.upsell_product)
      .forEach(u => {
        addItem({
          id: `${u.upsell_product!.id}-upsell-${Date.now()}`,
          item: {
            id: u.upsell_product!.id,
            name: u.upsell_product!.name,
            description: `Oferta combo com ${item.name}`,
            price: Number(u.extra_price),
            image: u.upsell_product!.image_url || '',
            category: (categorySlug as 'hamburgueres' | 'acai' | 'bebidas') || 'hamburgueres',
          },
          quantity,
          addBatata: false,
          bebida: null,
          totalPrice: Number(u.extra_price) * quantity,
        });
      });

    const upsellNames = upsells
      .filter(u => selectedUpsells.has(u.id) && u.upsell_product)
      .map(u => u.upsell_product!.name);

    toast({
      title: 'Adicionado ao carrinho!',
      description: `${quantity}x ${item.name}${upsellNames.length > 0 ? ` + ${upsellNames.join(', ')}` : ''} - ${formatPrice(total)}`,
    });

    setQuantity(1);
    setSelectedUpsells(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-card border-border overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        <div className="relative md:w-1/2 h-64 md:h-auto flex-shrink-0">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center min-h-[16rem]">
              <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 md:hidden p-2 bg-card/80 backdrop-blur rounded-full"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="md:w-1/2 flex flex-col overflow-y-auto">
          <div className="p-6 flex-1">
            <DialogTitle className="text-2xl font-bold text-foreground mb-2">
              {item.name}
            </DialogTitle>
            <p className="text-muted-foreground mb-4">{item.description}</p>
            <span
              className={cn(
                'text-2xl font-bold',
                categorySlug === 'acai' ? 'text-acai' : 'text-primary'
              )}
            >
              {formatPrice(Number(item.price))}
            </span>

            {/* Upsell Offers */}
            {upsells.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Aproveite também!</span>
                </div>
                <div className="space-y-2">
                  {upsells.map(u => (
                    <button
                      key={u.id}
                      onClick={() => toggleUpsell(u.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left',
                        selectedUpsells.has(u.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        selectedUpsells.has(u.id) ? 'border-primary bg-primary' : 'border-muted-foreground'
                      )}>
                        {selectedUpsells.has(u.id) && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.label}</p>
                        {u.upsell_product && (
                          <p className="text-xs text-muted-foreground">{u.upsell_product.name}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-primary whitespace-nowrap">
                        + {formatPrice(Number(u.extra_price))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-card sticky bottom-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-muted rounded-full p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-card text-foreground hover:bg-border transition-colors disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-card text-foreground hover:bg-border transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={cn(
                  'flex-1 py-3 rounded-full font-semibold transition-all duration-300',
                  'hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between px-6',
                  categorySlug === 'acai'
                    ? 'gradient-acai text-secondary-foreground'
                    : 'gradient-burger text-primary-foreground'
                )}
              >
                <span>Adicionar</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
