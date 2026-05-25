import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { CreateAuditLogUseCase } from '../../../audit/application/usecases/CreateAuditLogUseCase';
import { PublicUser } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { assertActiveUser } from '../services/assertActiveUser';

export interface DeactivateUserInput {
  actor: PublicUser;
  targetUserId: string;
  traceId: string;
}

export class DeactivateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly createAuditLog: CreateAuditLogUseCase,
  ) {}

  async execute({ actor, targetUserId, traceId }: DeactivateUserInput) {
    const targetUser = await this.userRepository.findById(targetUserId);
    assertActiveUser(targetUser);

    if (actor.id === targetUserId) {
      throw new ApplicationError('Nao e permitido desativar a propria conta.', 400, 'SELF_DEACTIVATION_FORBIDDEN');
    }

    if (targetUser.role === 'super_admin') {
      throw new ApplicationError('Nao e permitido desativar uma conta super admin.', 400, 'SUPER_ADMIN_DEACTIVATION_FORBIDDEN');
    }

    await this.userRepository.deactivate(targetUserId, new Date().toISOString());

    await this.createAuditLog.execute({
      actorUserId: actor.id,
      actorUserEmail: actor.email,
      targetEntity: 'user',
      targetEntityId: targetUser.id,
      action: 'user.deactivated',
      metadata: {
        targetUserEmail: targetUser.email,
        targetUserRole: targetUser.role,
      },
      traceId,
    });
  }
}