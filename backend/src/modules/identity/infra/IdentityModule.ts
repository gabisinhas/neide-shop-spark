import { Pool } from 'pg';
import { CreateAuditLogUseCase } from '../../audit/application/usecases/CreateAuditLogUseCase';
import { AuthenticateWithGoogleUseCase } from '../application/usecases/AuthenticateWithGoogleUseCase';
import { ConsumeOAuthLoginResultUseCase } from '../application/usecases/ConsumeOAuthLoginResultUseCase';
import { CreateOAuthLoginResultUseCase } from '../application/usecases/CreateOAuthLoginResultUseCase';
import { DeactivateUserUseCase } from '../application/usecases/DeactivateUserUseCase';
import { GetCurrentUserBySessionTokenUseCase } from '../application/usecases/GetCurrentUserBySessionTokenUseCase';
import { GetUserByIdUseCase } from '../application/usecases/GetUserByIdUseCase';
import { ListUsersUseCase } from '../application/usecases/ListUsersUseCase';
import { LoginUserUseCase } from '../application/usecases/LoginUserUseCase';
import { RegisterUserUseCase } from '../application/usecases/RegisterUserUseCase';
import { RefreshSessionUseCase } from '../application/usecases/RefreshSessionUseCase';
import { LogoutSessionUseCase } from '../application/usecases/LogoutSessionUseCase';
import { UpdateUserRoleUseCase } from '../application/usecases/UpdateUserRoleUseCase';
import { UpdateUserProfileUseCase } from '../application/usecases/UpdateUserProfileUseCase';
import { GoogleOAuthClient } from './google/GoogleOAuthClient';
import { GoogleOAuthStateService } from './google/GoogleOAuthStateService';
import { GoogleTokenVerifier } from './google/GoogleTokenVerifier';
import { PostgresOAuthLoginResultRepository } from './persistence/PostgresOAuthLoginResultRepository';
import { PostgresRefreshTokenRepository } from './persistence/PostgresRefreshTokenRepository';
import { PostgresSessionRepository } from './persistence/PostgresSessionRepository';
import { PostgresUserRepository } from './persistence/PostgresUserRepository';

export class IdentityModule {
  readonly userRepository: PostgresUserRepository;
  readonly sessionRepository: PostgresSessionRepository;
  readonly refreshTokenRepository: PostgresRefreshTokenRepository;
  readonly oauthLoginResultRepository: PostgresOAuthLoginResultRepository;
  readonly registerUser: RegisterUserUseCase;
  readonly loginUser: LoginUserUseCase;
  readonly authenticateWithGoogle: AuthenticateWithGoogleUseCase;
  readonly createOAuthLoginResult: CreateOAuthLoginResultUseCase;
  readonly consumeOAuthLoginResult: ConsumeOAuthLoginResultUseCase;
  readonly refreshSession: RefreshSessionUseCase;
  readonly getCurrentUserBySessionToken: GetCurrentUserBySessionTokenUseCase;
  readonly logoutSession: LogoutSessionUseCase;
  readonly getUserById: GetUserByIdUseCase;
  readonly listUsers: ListUsersUseCase;
  readonly updateUserProfile: UpdateUserProfileUseCase;
  readonly updateUserRole: UpdateUserRoleUseCase;
  readonly deactivateUser: DeactivateUserUseCase;
  readonly googleOAuthClient: GoogleOAuthClient;
  readonly googleOAuthStateService: GoogleOAuthStateService;

  constructor(pool: Pool, createAuditLog: CreateAuditLogUseCase) {
    this.userRepository = new PostgresUserRepository(pool);
    this.sessionRepository = new PostgresSessionRepository(pool);
    this.refreshTokenRepository = new PostgresRefreshTokenRepository(pool);
    this.oauthLoginResultRepository = new PostgresOAuthLoginResultRepository(pool);
    const googleTokenVerifier = new GoogleTokenVerifier();
    this.googleOAuthClient = new GoogleOAuthClient();
    this.googleOAuthStateService = new GoogleOAuthStateService();

    this.registerUser = new RegisterUserUseCase(this.userRepository, this.sessionRepository, this.refreshTokenRepository);
    this.loginUser = new LoginUserUseCase(this.userRepository, this.sessionRepository, this.refreshTokenRepository);
    this.authenticateWithGoogle = new AuthenticateWithGoogleUseCase(
      this.userRepository,
      this.sessionRepository,
      this.refreshTokenRepository,
      googleTokenVerifier,
    );
    this.createOAuthLoginResult = new CreateOAuthLoginResultUseCase(this.oauthLoginResultRepository);
    this.consumeOAuthLoginResult = new ConsumeOAuthLoginResultUseCase(this.oauthLoginResultRepository);
    this.refreshSession = new RefreshSessionUseCase(this.userRepository, this.sessionRepository, this.refreshTokenRepository);
    this.getCurrentUserBySessionToken = new GetCurrentUserBySessionTokenUseCase(this.userRepository, this.sessionRepository);
    this.logoutSession = new LogoutSessionUseCase(this.sessionRepository, this.refreshTokenRepository);
    this.getUserById = new GetUserByIdUseCase(this.userRepository);
    this.listUsers = new ListUsersUseCase(this.userRepository);
    this.updateUserProfile = new UpdateUserProfileUseCase(this.userRepository);
    this.updateUserRole = new UpdateUserRoleUseCase(this.userRepository, createAuditLog);
    this.deactivateUser = new DeactivateUserUseCase(this.userRepository, createAuditLog);
  }
}
