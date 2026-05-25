import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { Address } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { sanitizeUser } from './RegisterUserUseCase';
import { assertActiveUser } from '../services/assertActiveUser';

export interface UpdateUserProfileInput {
  name: string;
  address?: Address;
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, input: UpdateUserProfileInput) {
    const user = await this.userRepository.findById(userId);
    assertActiveUser(user);

    const updatedUser = await this.userRepository.update({
      ...user,
      name: input.name.trim(),
      address: input.address,
    });

    return sanitizeUser(updatedUser);
  }
}