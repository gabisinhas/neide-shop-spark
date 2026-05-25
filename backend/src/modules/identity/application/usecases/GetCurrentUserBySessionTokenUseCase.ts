import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { sanitizeUser } from './RegisterUserUseCase';
import { assertActiveUser } from '../services/assertActiveUser';

export class GetCurrentUserBySessionTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(token: string) {
    const userId = await this.sessionRepository.findUserIdByToken(token);

    if (!userId) {
      throw new ApplicationError('Sessao expirada ou invalida.', 401, 'SESSION_INVALID');
    }

    const user = await this.userRepository.findById(userId);
    assertActiveUser(user, 'SESSION_USER_NOT_FOUND');

    return sanitizeUser(user);
  }
}