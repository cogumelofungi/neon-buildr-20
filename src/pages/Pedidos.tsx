import { useCart, Order } from '@/contexts/CartContext';
import { ClipboardList, Package, Calendar, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const Pedidos = () => {
  const { orders } = useCart();

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4">
            <ClipboardList className="w-5 h-5" />
            <span className="font-semibold">Histórico</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meus <span className="text-gradient-burger">Pedidos</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Acompanhe todos os pedidos que você realizou
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum pedido ainda
            </h3>
            <p className="text-muted-foreground">
              Seus pedidos aparecerão aqui após finalizar uma compra.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className={cn(
                  'bg-card rounded-2xl border border-border p-6 animate-fade-in',
                  'hover:border-primary/30 transition-all duration-300'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-burger flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Pedido #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.date)}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                    order.status === 'sent'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  )}>
                    {order.status === 'sent' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Enviado
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        Pendente
                      </>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((cartItem) => (
                    <div
                      key={cartItem.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cartItem.item.image}
                          alt={cartItem.item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {cartItem.quantity}x {cartItem.item.name}
                          </p>
                          {(cartItem.addBatata || cartItem.bebida) && (
                            <p className="text-xs text-muted-foreground">
                              {[
                                cartItem.addBatata && 'Batata',
                                cartItem.bebida?.name,
                              ]
                                .filter(Boolean)
                                .join(' + ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">
                        {formatPrice(cartItem.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pedidos;
