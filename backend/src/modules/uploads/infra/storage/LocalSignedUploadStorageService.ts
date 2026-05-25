import { createHmac, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { CreateSignedUploadStorageInput, UploadStorageService } from '../../domain/services/UploadStorageService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_UPLOADS_DIR = path.resolve(__dirname, '../../../../../public/assets/uploads');

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

function createSignature(secret: string, key: string, contentType: string, expiresAt: string) {
  return createHmac('sha256', secret).update(`${key}:${contentType}:${expiresAt}`).digest('hex');
}

export class LocalSignedUploadStorageService implements UploadStorageService {
  constructor(
    private readonly appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3001',
    private readonly uploadSigningSecret = process.env.UPLOAD_SIGNING_SECRET || 'dev-local-upload-secret',
  ) {}

  async createSignedUpload(input: CreateSignedUploadStorageInput) {
    const key = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${sanitizeFilename(input.filename)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const signature = createSignature(this.uploadSigningSecret, key, input.contentType, expiresAt);
    const baseUrl = this.appBaseUrl.replace(/\/$/, '');

    return {
      provider: 'local' as const,
      method: 'PUT' as const,
      uploadUrl: `${baseUrl}/api/uploads/local?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(input.contentType)}&expiresAt=${encodeURIComponent(expiresAt)}&signature=${signature}`,
      publicUrl: `${baseUrl}/assets/uploads/${key}`,
      headers: {
        'Content-Type': input.contentType,
      },
      expiresAt,
    };
  }

  async writeSignedUpload(input: {
    key: string;
    contentType: string;
    expiresAt: string;
    signature: string;
    body: Buffer;
  }) {
    const expectedSignature = createSignature(this.uploadSigningSecret, input.key, input.contentType, input.expiresAt);

    if (expectedSignature !== input.signature) {
      throw new ApplicationError('Assinatura de upload invalida.', 403, 'UPLOAD_SIGNATURE_INVALID');
    }

    if (Date.parse(input.expiresAt) < Date.now()) {
      throw new ApplicationError('A URL de upload expirou.', 410, 'UPLOAD_URL_EXPIRED');
    }

    const filePath = path.resolve(PUBLIC_UPLOADS_DIR, input.key);

    if (!filePath.startsWith(PUBLIC_UPLOADS_DIR)) {
      throw new ApplicationError('Chave de upload invalida.', 400, 'UPLOAD_KEY_INVALID');
    }

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.body);
  }
}
