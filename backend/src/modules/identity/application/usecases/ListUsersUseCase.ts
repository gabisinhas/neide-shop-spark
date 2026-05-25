import { UserRepository } from '../../domain/repositories/UserRepository';
import { sanitizeUser } from './RegisterUserUseCase';

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute() {
    const users = await this.userRepository.list();
    return users.map((user) => sanitizeUser(user));
  }
}
