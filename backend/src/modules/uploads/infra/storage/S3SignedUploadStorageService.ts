import { createHmac, randomUUID } from 'node:crypto';
import { SignedUpload } from '../../domain/entities/SignedUpload';
import { CreateSignedUploadStorageInput, UploadStorageService } from '../../domain/services/UploadStorageService';

function hash(value: string) {
  return createHmac('sha256', '').update(value).digest('hex');
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest();
}

function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(/[!*'()]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

export class S3SignedUploadStorageService implements UploadStorageService {
  constructor(
    private readonly region = process.env.AWS_S3_REGION || 'us-east-1',
    private readonly bucket = process.env.AWS_S3_BUCKET || '',
    private readonly accessKeyId = process.env.AWS_ACCESS_KEY_ID || '',
    private readonly secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '',
    private readonly publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL,
  ) {}

  async createSignedUpload(input: CreateSignedUploadStorageInput): Promise<SignedUpload> {
    const key = `products/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${sanitizeFilename(input.filename)}`;
    const expiresInSeconds = 900;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const shortDate = amzDate.slice(0, 8);
    const host = `${this.bucket}.s3.${this.region}.amazonaws.com`;
    const credentialScope = `${shortDate}/${this.region}/s3/aws4_request`;
    const canonicalUri = `/${key.split('/').map(encodeRfc3986).join('/')}`;
    const queryParams = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${this.accessKeyId}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(expiresInSeconds),
      'X-Amz-SignedHeaders': 'host',
    });

    const canonicalRequest = [
      'PUT',
      canonicalUri,
      queryParams.toString(),
      `host:${host}\n`,
      'host',
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      hash(canonicalRequest),
    ].join('\n');

    const signingKey = hmac(
      hmac(
        hmac(hmac(`AWS4${this.secretAccessKey}`, shortDate), this.region),
        's3',
      ),
      'aws4_request',
    );

    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    queryParams.set('X-Amz-Signature', signature);

    const baseUrl = `https://${host}${canonicalUri}`;
    const publicUrl = this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`
      : `https://${host}/${key}`;

    return {
      provider: 's3',
      method: 'PUT',
      uploadUrl: `${baseUrl}?${queryParams.toString()}`,
      publicUrl,
      headers: {
        'Content-Type': input.contentType,
      },
      expiresAt: new Date(now.getTime() + expiresInSeconds * 1000).toISOString(),
    };
  }
}
