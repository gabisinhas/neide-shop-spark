import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Chrome, LockKeyhole, Mail, UserRound } from 'lucide-react';
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

export default function AuthPage() {
  const { signIn, register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || APP_ROUTES.orders;

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [address, setAddress] = useState<OrderAddress>(INITIAL_ADDRESS);
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAddressChange = (field: keyof OrderAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleGoogle = () => {
    setError('');
    signInWithGoogle(redirectTo);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
      } else {
        if (form.password !== form.confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }

        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          address: {
            ...address,
            recipient: address.recipient || form.name,
          },
        });
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível autenticar.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] bg-card rounded-2xl shadow-card overflow-hidden border border-border">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-gold text-primary-foreground p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] opacity-80">NS Closet</p>
            <h1 className="font-display text-5xl font-bold mt-4">Venda com carinho. Compre com confiança.</h1>
          </div>
          <div className="space-y-3 text-sm opacity-95">
            <p>Crie sua conta para acompanhar entregas, revisar pedidos e comprar de novo em poucos cliques.</p>
            <p>Para testes: o super admin seed usa `superadmin@nscloset.com` com senha `admin123`.</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                {mode === 'signin' ? 'Entrar na conta' : 'Criar conta'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Google e cadastro próprio já estão preparados na experiência do app.
              </p>
            </div>
            <Link to={APP_ROUTES.home} className="text-sm text-primary font-semibold">
              Voltar
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-full bg-secondary p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${mode === 'signin' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Cadastrar
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full border border-border rounded-xl px-4 py-3 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <Chrome size={18} />
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">ou</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-foreground mb-1 block">Nome</span>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </label>

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
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                        required
                      />
                    </label>
                  ))}
                </div>
              </>
            )}

            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">E-mail</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm"
                  placeholder="voce@email.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground mb-1 block">Senha</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </label>

            {mode === 'register' && (
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-1 block">Confirmar senha</span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm"
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>
              </label>
            )}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <button type="submit" className="w-full bg-gradient-gold text-primary-foreground py-3 rounded-xl font-semibold">
              {mode === 'signin' ? 'Entrar agora' : 'Criar minha conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
