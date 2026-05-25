import { CreateSignedUploadUseCase } from '../application/usecases/CreateSignedUploadUseCase';
import { LocalSignedUploadStorageService } from './storage/LocalSignedUploadStorageService';
import { S3SignedUploadStorageService } from './storage/S3SignedUploadStorageService';

export class UploadsModule {
  readonly localStorage: LocalSignedUploadStorageService;
  readonly createSignedUpload: CreateSignedUploadUseCase;

  constructor() {
    this.localStorage = new LocalSignedUploadStorageService();

    const hasS3Configuration = Boolean(
      process.env.AWS_S3_BUCKET &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY,
    );

    const storage = hasS3Configuration
      ? new S3SignedUploadStorageService()
      : this.localStorage;

    this.createSignedUpload = new CreateSignedUploadUseCase(storage);
  }
}
