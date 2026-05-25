import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { SignedUpload } from '../../domain/entities/SignedUpload';
import { UploadStorageService } from '../../domain/services/UploadStorageService';

export interface CreateSignedUploadInput {
  filename: string;
  contentType: string;
}

export class CreateSignedUploadUseCase {
  constructor(private readonly uploadStorageService: UploadStorageService) {}

  async execute(input: CreateSignedUploadInput): Promise<SignedUpload> {
    const filename = input.filename.trim();
    const contentType = input.contentType.trim().toLowerCase();

    if (!filename) {
      throw new ApplicationError('Nome do arquivo e obrigatorio.', 400, 'UPLOAD_FILENAME_REQUIRED');
    }

    if (!['image/jpeg', 'image/jpg'].includes(contentType)) {
      throw new ApplicationError('Apenas imagens JPEG podem ser enviadas.', 400, 'UPLOAD_CONTENT_TYPE_INVALID');
    }

    return this.uploadStorageService.createSignedUpload({
      filename,
      contentType: 'image/jpeg',
    });
  }
}
