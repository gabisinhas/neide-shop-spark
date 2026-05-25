import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { sanitizeUser } from './RegisterUserUseCase';
import { assertActiveUser } from '../services/assertActiveUser';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    assertActiveUser(user);

    return sanitizeUser(user);
  }
}