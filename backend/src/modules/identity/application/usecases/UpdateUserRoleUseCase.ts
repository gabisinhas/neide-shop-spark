import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { CreateAuditLogUseCase } from '../../../audit/application/usecases/CreateAuditLogUseCase';
import { PublicUser, UserRole } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { sanitizeUser } from './RegisterUserUseCase';
import { assertActiveUser } from '../services/assertActiveUser';

export interface UpdateUserRoleInput {
  actor: PublicUser;
  targetUserId: string;
  role: UserRole;
  traceId: string;
}

const ALLOWED_ROLES: UserRole[] = ['customer', 'admin', 'super_admin'];

export class UpdateUserRoleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly createAuditLog: CreateAuditLogUseCase,
  ) {}

  async execute({ actor, targetUserId, role, traceId }: UpdateUserRoleInput) {
    if (!ALLOWED_ROLES.includes(role)) {
      throw new ApplicationError('Role informada e invalida.', 400, 'INVALID_ROLE');
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    assertActiveUser(targetUser);

    if (actor.id === targetUserId && actor.role === 'super_admin' && role !== 'super_admin') {
      throw new ApplicationError('Super admin nao pode remover o proprio acesso privilegiado.', 400, 'SELF_ROLE_CHANGE_FORBIDDEN');
    }

    if (targetUser.role === role) {
      return sanitizeUser(targetUser);
    }

    const updated = await this.userRepository.update({
      ...targetUser,
      role,
    });

    await this.createAuditLog.execute({
      actorUserId: actor.id,
      actorUserEmail: actor.email,
      targetEntity: 'user',
      targetEntityId: targetUser.id,
      action: 'user.role.updated',
      metadata: {
        previousRole: targetUser.role,
        nextRole: role,
        targetUserEmail: targetUser.email,
      },
      traceId,
    });

    return sanitizeUser(updated);
  }
}
