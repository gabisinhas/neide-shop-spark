import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { OrderAddress } from '@/domain/entities/Order';
import { ShippingOption, ShippingService } from '@/domain/entities/Shipping';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useCart } from '@/presentation/contexts/CartContext';
import { useOrders } from '@/presentation/contexts/OrderContext';
import { APP_ROUTES } from '@/presentation/routes/paths';
import { apiRequest, formatApiError } from '@/shared/api/httpClient';
import { getEffectiveProductPrice } from '@/shared/utils/productPricing';

const INITIAL_ADDRESS: OrderAddress = {
  recipient: '',
  phone: '',
  street: '',
  number: '',
  district: '',
  city: '',
  state: '',
  zipCode: '',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { createOrder } = useOrders();
  const [address, setAddress] = useState<OrderAddress>({
    ...INITIAL_ADDRESS,
    ...currentUser?.address,
    recipient: currentUser?.address?.recipient || currentUser?.name || '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'bank_slip'>('pix');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingService, setSelectedShippingService] = useState<ShippingService | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const selectedShippingOption = useMemo(
    () => shippingOptions.find((option) => option.service === selectedShippingService) ?? null,
    [selectedShippingService, shippingOptions],
  );

  const shippingFee = selectedShippingOption?.price ?? 0;

  if (!currentUser) {
    return <Navigate to={APP_ROUTES.auth} replace state={{ from: APP_ROUTES.checkout }} />;
  }

  if (items.length === 0) {
    return <Navigate to={APP_ROUTES.home} replace />;
  }

  const handleChange = (field: keyof OrderAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));

    if (field === 'zipCode' || field === 'state') {
      setShippingOptions([]);
      setSelectedShippingService(null);
      setShippingError(null);
    }
  };

  const handleCalculateShipping = async () => {
    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      const options = await apiRequest<ShippingOption[]>('/shipping/calculate', {
        method: 'POST',
        body: JSON.stringify({
          address,
          items,
        }),
      });

      setShippingOptions(options);
      setSelectedShippingService(options[0]?.service ?? null);
    } catch (error) {
      setShippingOptions([]);
      setSelectedShippingService(null);
      setShippingError(formatApiError(error, 'Nao foi possivel calcular o frete.'));
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedShippingService) {
      setShippingError('Calcule e selecione uma opcao de frete antes de continuar.');
      return;
    }

    await createOrder({
      user: currentUser,
      items,
      paymentMethod,
      address,
      shippingService: selectedShippingService,
    });

    await clearCart();
    navigate(APP_ROUTES.orders);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-6xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Finalizar compra</h1>
            <p className="mt-1 text-sm text-muted-foreground">Preencha entrega, calcule o frete e escolha a forma de pagamento.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['recipient', 'Nome do destinatario'],
              ['phone', 'Telefone'],
              ['street', 'Rua'],
              ['number', 'Numero'],
              ['district', 'Bairro'],
              ['city', 'Cidade'],
              ['state', 'Estado'],
              ['zipCode', 'CEP'],
            ].map(([field, label]) => (
              <label key={field} className={`block ${field === 'street' ? 'sm:col-span-2' : ''}`}>
                <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
                <input
                  value={address[field as keyof OrderAddress]}
                  onChange={(e) => handleChange(field as keyof OrderAddress, e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                  required
                />
              </label>
            ))}
          </div>

          <div className="space-y-4 rounded-2xl border border-border p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Frete</h2>
                <p className="text-sm text-muted-foreground">Calcule PAC ou SEDEX com base no endereco de entrega.</p>
              </div>
              <button
                type="button"
                onClick={() => void handleCalculateShipping()}
                disabled={isCalculatingShipping}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {isCalculatingShipping ? 'Calculando...' : 'Calcular frete'}
              </button>
            </div>

            {shippingError ? <p className="text-sm text-destructive">{shippingError}</p> : null}

            {shippingOptions.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {shippingOptions.map((option) => (
                  <button
                    key={option.service}
                    type="button"
                    onClick={() => setSelectedShippingService(option.service)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${selectedShippingService === option.service ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <p className="text-sm font-semibold text-primary">
                        {option.price === 0 ? 'Gratis' : `R$ ${option.price.toFixed(2).replace('.', ',')}`}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Entrega estimada em ate {option.estimatedDays} dia(s) uteis.</p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h2 className="mb-3 font-display text-2xl font-semibold text-foreground">Pagamento</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['pix', 'PIX', 'Confirmacao mais rapida'],
                ['credit_card', 'Cartao', 'Parcelamento em breve'],
                ['bank_slip', 'Boleto', 'Compensacao em ate 2 dias'],
              ].map(([value, label, helper]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value as typeof paymentMethod)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${paymentMethod === value ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                >
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(APP_ROUTES.home)} className="rounded-xl border border-border px-5 py-3 text-sm font-semibold">
              Continuar comprando
            </button>
            <button type="submit" className="rounded-xl bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground">
              Confirmar pedido
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 font-display text-2xl font-semibold text-foreground">Resumo</h2>
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3">
                <img src={product.image} alt={product.name} className="h-20 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{quantity} unidade(s)</p>
                </div>
                <p className="text-sm font-semibold text-primary">R$ {(getEffectiveProductPrice(product) * quantity).toFixed(2).replace('.', ',')}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega</span>
              <span>
                {selectedShippingOption
                  ? shippingFee === 0
                    ? 'Gratis'
                    : `R$ ${shippingFee.toFixed(2).replace('.', ',')}`
                  : 'Calcule o frete'}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold text-foreground">
              <span>Total</span>
              <span>R$ {(totalPrice + shippingFee).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
