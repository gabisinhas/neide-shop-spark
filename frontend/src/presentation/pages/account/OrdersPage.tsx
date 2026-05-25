import { PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useOrders } from '@/presentation/contexts/OrderContext';
import { orderStatusLabels, orderStatusTone } from '@/shared/constants/orders';
import { APP_ROUTES } from '@/presentation/routes/paths';
import { getEffectiveProductPrice } from '@/shared/utils/productPricing';

export default function OrdersPage() {
  const { currentUser } = useAuth();
  const { getOrdersByUser } = useOrders();

  const orders = currentUser ? getOrdersByUser(currentUser.id) : [];

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Meus pedidos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe status, entrega e o histórico das suas compras.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link to={APP_ROUTES.profile} className="text-primary">
              Meu perfil
            </Link>
            <Link to={APP_ROUTES.home} className="text-primary">
              Continuar comprando
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-card">
            <PackageCheck className="mx-auto text-primary mb-4" size={42} />
            <h2 className="font-display text-2xl font-semibold text-foreground">Nenhum pedido por aqui ainda</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-5">
              Assim que você finalizar uma compra, ela aparece aqui com o andamento completo.
            </p>
            <Link to={APP_ROUTES.home} className="inline-flex px-5 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-semibold">
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="bg-card border border-border rounded-2xl p-5 shadow-card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">{order.id}</p>
                    <h2 className="font-display text-2xl font-semibold text-foreground mt-1">
                      Pedido de {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${orderStatusTone[order.status]}`}>
                    {orderStatusLabels[order.status]}
                  </span>
                </div>

                <div className="mt-5 grid md:grid-cols-[1.3fr_0.7fr] gap-6">
                  <div className="space-y-3">
                    {order.items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-14 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{quantity} unidade(s)</p>
                        </div>
                        <p className="text-sm font-semibold text-primary">
                          R$ {(getEffectiveProductPrice(product) * quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-background rounded-2xl p-4 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">Entrega</p>
                    <p className="text-muted-foreground">
                      {order.address.street}, {order.address.number} - {order.address.district}
                    </p>
                    <p className="text-muted-foreground">
                      {order.address.city}/{order.address.state} - {order.address.zipCode}
                    </p>
                    <div className="pt-3 mt-3 border-t border-border">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pagamento</span>
                        <span>{order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'credit_card' ? 'Cartão' : 'Boleto'}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-foreground">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
