import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { User } from '../../domain/entities/User';

export function assertActiveUser(user: User | null | undefined, code = 'USER_NOT_FOUND'): asserts user is User {
  if (!user || user.deletedAt) {
    throw new ApplicationError('Usuario nao encontrado.', 404, code);
  }
}

export function assertUserNotDeactivated(user: User | null | undefined, code = 'USER_DEACTIVATED') {
  if (user?.deletedAt) {
    throw new ApplicationError('Conta desativada.', 403, code);
  }
}