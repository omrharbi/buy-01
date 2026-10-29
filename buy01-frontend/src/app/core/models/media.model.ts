/** One stored image, as the Media service reports it after an upload. */
export interface MediaRef {
  id: string;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface QueuedUpload {
  localId: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'failed';
  media: MediaRef | null;
  error: string | null;
}
