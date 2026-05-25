import { PublicUser } from '../entities/User';

export interface OAuthLoginResultPayload {
  accessToken: string;
  user: PublicUser;
}

export interface OAuthLoginResult {
  token: string;
  payload: OAuthLoginResultPayload;
  expiresAt: string;
}

export interface OAuthLoginResultRepository {
  create(result: OAuthLoginResult): Promise<void>;
  consume(token: string): Promise<OAuthLoginResultPayload | null>;
}