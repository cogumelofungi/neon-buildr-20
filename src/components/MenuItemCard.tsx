import { useState } from 'react';
import { cn } from '@/lib/utils';
import ProductDetailDialog from './ProductDetailDialog';
import { Image as ImageIcon } from 'lucide-react';

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    is_popular: boolean;
    category_id: string;
    categories?: { name: string; slug: string; icon: string } | null;
  };
  index: number;
}

const MenuItemCard = ({ item, index }: MenuItemCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const categorySlug = item.categories?.slug;

  return (
    <>
      <div
        onClick={() => setDialogOpen(true)}
        className={cn(
          'group relative bg-card rounded-xl overflow-hidden border border-border cursor-pointer',
          'hover:border-primary/50 transition-all duration-300',
          'hover:shadow-[0_8px_32px_hsl(var(--primary)/0.15)]',
          'animate-fade-in flex'
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          {item.is_popular && (
            <span className="inline-block gradient-burger text-primary-foreground text-xs font-bold px-2 py-0.5 rounded mb-2 w-fit">
              MAIS PEDIDO
            </span>
          )}

          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>
          </div>

          <span
            className={cn(
              'text-lg font-bold',
              categorySlug === 'acai' ? 'text-acai' : 'text-primary'
            )}
          >
            {formatPrice(item.price)}
          </span>
        </div>

        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 m-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </div>

      <ProductDetailDialog
        item={item}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default MenuItemCard;
