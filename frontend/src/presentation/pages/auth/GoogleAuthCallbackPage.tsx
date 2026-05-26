import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { APP_ROUTES } from '@/presentation/routes/paths';

export default function GoogleAuthCallbackPage() {
  const { completeGoogleOAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const hasProcessedLogin = useRef(false);

  useEffect(() => {
    if (hasProcessedLogin.current) {
      return;
    }

    const errorCode = searchParams.get('error');
    const token = searchParams.get('token');
    const redirectTo = searchParams.get('redirectTo') || APP_ROUTES.orders;

    if (errorCode) {
      hasProcessedLogin.current = true;
      setError(`Google retornou um erro de autenticacao: ${errorCode}.`);
      return;
    }

    if (!token) {
      hasProcessedLogin.current = true;
      setError('Token de conclusao do login Google ausente.');
      return;
    }

    hasProcessedLogin.current = true;

    const finishLogin = async () => {
      try {
        await completeGoogleOAuth(token);
        navigate(redirectTo, { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nao foi possivel concluir o login com Google.');
      }
    };

    void finishLogin();
  }, [completeGoogleOAuth, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">NS Closet</p>
        <h1 className="font-display text-3xl font-bold text-foreground">Concluindo login com Google</h1>
        {error ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <Link to={APP_ROUTES.auth} className="inline-flex rounded-xl bg-gradient-gold px-5 py-3 font-semibold text-primary-foreground">
              Voltar para entrar
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Estamos validando sua autenticacao e preparando sua sessao.</p>
        )}
      </div>
    </div>
  );
}