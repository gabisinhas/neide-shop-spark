import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinHouse, Save, UserRound } from 'lucide-react';
import { OrderAddress } from '@/domain/entities/Order';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { APP_ROUTES } from '@/presentation/routes/paths';

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

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [address, setAddress] = useState<OrderAddress>({
    ...INITIAL_ADDRESS,
    ...currentUser?.address,
    recipient: currentUser?.address?.recipient || currentUser?.name || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddressChange = (field: keyof OrderAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await updateProfile({
        name,
        address: {
          ...address,
          recipient: address.recipient || name,
        },
      });
      setSuccess('Perfil atualizado com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar seu perfil.');
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Meu perfil</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Mantenha seus dados e endereço atualizados para agilizar as próximas compras.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link to={APP_ROUTES.orders} className="text-primary">
              Meus pedidos
            </Link>
            <Link to={APP_ROUTES.home} className="text-primary">
              Continuar comprando
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <section className="bg-background rounded-2xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <UserRound className="text-primary" size={22} />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">Dados da conta</h2>
                  <p className="text-sm text-muted-foreground">Os dados principais da sua conta ficam aqui.</p>
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">Nome</span>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">E-mail</span>
                <input
                  value={currentUser?.email ?? ''}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground"
                  disabled
                />
              </label>
            </section>

            <section className="bg-background rounded-2xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <MapPinHouse className="text-primary" size={22} />
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">Endereço</h2>
                  <p className="text-sm text-muted-foreground">Esse endereço será usado como base no checkout.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ['recipient', 'Nome do destinatário'],
                  ['phone', 'Telefone'],
                  ['street', 'Rua'],
                  ['number', 'Número'],
                  ['district', 'Bairro'],
                  ['city', 'Cidade'],
                  ['state', 'Estado'],
                  ['zipCode', 'CEP'],
                ].map(([field, label]) => (
                  <label key={field} className={`block ${field === 'street' ? 'sm:col-span-2' : ''}`}>
                    <span className="text-sm font-medium text-foreground mb-1 block">{label}</span>
                    <input
                      value={address[field as keyof OrderAddress]}
                      onChange={(e) => handleAddressChange(field as keyof OrderAddress, e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
                      required
                    />
                  </label>
                ))}
              </div>
            </section>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

          <div className="flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-semibold">
              <Save size={18} />
              Salvar perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
