import { SignedUpload } from '../entities/SignedUpload';

export interface CreateSignedUploadStorageInput {
  filename: string;
  contentType: string;
}

export interface UploadStorageService {
  createSignedUpload(input: CreateSignedUploadStorageInput): Promise<SignedUpload>;
}
