import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { OAuthLoginResultRepository } from '../../domain/repositories/OAuthLoginResultRepository';

export interface ConsumeOAuthLoginResultInput {
  token: string;
}

export class ConsumeOAuthLoginResultUseCase {
  constructor(private readonly repository: OAuthLoginResultRepository) {}

  async execute(input: ConsumeOAuthLoginResultInput) {
    const token = input.token?.trim();

    if (!token) {
      throw new ApplicationError('Token de conclusao do Google ausente.', 400, 'GOOGLE_OAUTH_RESULT_MISSING');
    }

    const auth = await this.repository.consume(token);

    if (!auth) {
      throw new ApplicationError('Login Google expirado ou invalido.', 401, 'GOOGLE_OAUTH_RESULT_INVALID');
    }

    return auth;
  }
}