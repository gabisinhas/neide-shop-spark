import express from 'express';
import { ApplicationError } from '../../application/ApplicationError';
import { PublicUser } from '../../../modules/identity/domain/entities/User';
import { isAdminRole, isSuperAdminRole } from '../../../modules/identity/domain/services/roleGuards';
import { IdentityModule } from '../../../modules/identity/infra/IdentityModule';

export interface AuthGuards {
  requireAuth: express.RequestHandler;
  requireAdmin: express.RequestHandler;
  requireSuperAdmin: express.RequestHandler;
  requireSelfOrAdmin: (paramName: string) => express.RequestHandler;
}

export function createAuthGuards(identity: IdentityModule): AuthGuards {
  const requireAuth: express.RequestHandler = async (req, res, next) => {
    try {
      const token = extractBearerToken(req);

      if (!token) {
        throw new ApplicationError('Sessao nao autenticada.', 401, 'AUTH_REQUIRED');
      }

      const user = await identity.getCurrentUserBySessionToken.execute(token);
      res.locals.currentUser = user;
      res.locals.accessToken = token;
      next();
    } catch (error) {
      next(error);
    }
  };

  const requireAdmin: express.RequestHandler = (req, res, next) => {
    try {
      const user = getCurrentUserFromLocals(res);

      if (!isAdminRole(user.role)) {
        throw new ApplicationError('Voce nao tem permissao para acessar este recurso.', 403, 'ADMIN_REQUIRED');
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  const requireSuperAdmin: express.RequestHandler = (req, res, next) => {
    try {
      const user = getCurrentUserFromLocals(res);

      if (!isSuperAdminRole(user.role)) {
        throw new ApplicationError('Voce nao tem permissao para acessar este recurso.', 403, 'SUPER_ADMIN_REQUIRED');
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  const requireSelfOrAdmin = (paramName: string): express.RequestHandler => {
    return (req, res, next) => {
      try {
        const user = getCurrentUserFromLocals(res);
        const resourceId = req.params[paramName];

        if (!isAdminRole(user.role) && user.id !== resourceId) {
          throw new ApplicationError('Voce nao tem permissao para acessar este recurso.', 403, 'RESOURCE_FORBIDDEN');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  return {
    requireAuth,
    requireAdmin,
    requireSuperAdmin,
    requireSelfOrAdmin,
  };
}

export function getCurrentUserFromLocals(res: express.Response): PublicUser {
  const currentUser = res.locals.currentUser as PublicUser | undefined;

  if (!currentUser) {
    throw new ApplicationError('Sessao nao autenticada.', 401, 'AUTH_REQUIRED');
  }

  return currentUser;
}

export function getSessionTokenFromLocals(res: express.Response): string {
  const token = res.locals.accessToken as string | undefined;

  if (!token) {
    throw new ApplicationError('Sessao nao autenticada.', 401, 'AUTH_REQUIRED');
  }

  return token;
}

function extractBearerToken(req: express.Request) {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}
