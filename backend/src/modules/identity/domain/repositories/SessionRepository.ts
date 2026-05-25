export interface Session {
  token: string;
  userId: string;
}

export interface SessionRepository {
  create(session: Session): Promise<void>;
  findUserIdByToken(token: string): Promise<string | null>;
  delete(token: string): Promise<void>;
}