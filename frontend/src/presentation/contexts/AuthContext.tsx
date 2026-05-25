import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { OrderAddress } from '@/domain/entities/Order';
import { User } from '@/domain/entities/User';
import { apiRequest, buildApiUrl, clearStoredAccessToken, formatApiError, setStoredAccessToken } from '@/shared/api/httpClient';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  address: OrderAddress;
};

type UpdateProfileInput = {
  name: string;
  address: OrderAddress;
};

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => void;
  completeGoogleOAuth: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthResponse = {
  accessToken: string;
  user: User;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const payload = await apiRequest<{ user: User }>('/auth/me');
        setCurrentUser(payload.user);
      } catch (error) {
        clearStoredAccessToken();
        setCurrentUser(null);

        if (error instanceof Error && !error.message.includes('Sessao expirada') && !error.message.includes('Sessao nao autenticada')) {
          console.error({ scope: 'AuthContext.hydrateSession', error });
        }
      } finally {
        setIsLoading(false);
      }
    };

    void hydrateSession();
  }, []);

  const persistAuthentication = ({ accessToken, user }: AuthResponse) => {
    setStoredAccessToken(accessToken);
    setCurrentUser(user);
  };

  const register = async ({ name, email, password, address }: RegisterInput) => {
    try {
      const auth = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          address,
        }),
      });

      persistAuthentication(auth);
    } catch (error) {
      console.error({ scope: 'AuthContext.register', error, email });
      throw new Error(formatApiError(error, 'Nao foi possivel criar sua conta.'));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const auth = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      persistAuthentication(auth);
    } catch (error) {
      console.error({ scope: 'AuthContext.signIn', error, email });
      throw new Error(formatApiError(error, 'Nao foi possivel autenticar.'));
    }
  };

  const updateProfile = async ({ name, address }: UpdateProfileInput) => {
    if (!currentUser) {
      throw new Error('Voce precisa estar autenticado para atualizar o perfil.');
    }

    try {
      const updatedUser = await apiRequest<User>(`/users/${currentUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, address }),
      });
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error({ scope: 'AuthContext.updateProfile', error, userId: currentUser.id });
      throw new Error(formatApiError(error, 'Nao foi possivel atualizar seu perfil.'));
    }
  };

  const signInWithGoogle = (redirectTo?: string) => {
    const authUrl = new URL(buildApiUrl('/auth/google'), window.location.origin);

    if (redirectTo?.trim()) {
      authUrl.searchParams.set('redirectTo', redirectTo.trim());
    }

    window.location.assign(authUrl.toString());
  };

  const completeGoogleOAuth = async (token: string) => {
    try {
      const auth = await apiRequest<AuthResponse>('/auth/google/exchange', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      persistAuthentication(auth);
    } catch (error) {
      console.error({ scope: 'AuthContext.completeGoogleOAuth', error });
      throw new Error(formatApiError(error, 'Nao foi possivel concluir o login com o Google.'));
    }
  };

  const signOut = async () => {
    try {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error({ scope: 'AuthContext.signOut', error });
    } finally {
      clearStoredAccessToken();
      setCurrentUser(null);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      isAuthenticated: Boolean(currentUser),
      signIn,
      register,
      updateProfile,
      signInWithGoogle,
      completeGoogleOAuth,
      signOut,
    }),
    [currentUser, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
