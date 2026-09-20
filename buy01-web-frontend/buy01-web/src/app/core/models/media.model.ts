/** One stored image, as the Media service reports it after an upload. */
export interface MediaRef {
  id: string;
  /** Where to render it from: GET /media/images/{id}. */
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  ownerId: string;
  uploadedAt: string;
}

/** A file in the uploader's queue, before, during and after its request. */
export interface QueuedUpload {
  localId: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'failed';
  media: MediaRef | null;
  error: string | null;
}
