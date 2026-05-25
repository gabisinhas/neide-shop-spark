export interface SignedUpload {
  provider: 's3' | 'local';
  method: 'PUT';
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
}
