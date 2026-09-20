import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API } from '../config/api.config';
import { MediaRef } from '../models/media.model';

export type UploadEvent =
  | { type: 'progress'; value: number }
  | { type: 'done'; media: MediaRef };

/**
 * The Media service. Uploads report progress per file, because a person who picked six
 * images needs to see which one is still going.
 */
@Injectable({ providedIn: 'root' })
export class MediaApi {
  private readonly http = inject(HttpClient);

  upload(file: File): Observable<UploadEvent> {
    const form = new FormData();
    form.append('file', file, file.name);

    return this.http
      .post<MediaRef>(API.media.upload, form, { reportProgress: true, observe: 'events' })
      .pipe(map((event) => this.toUploadEvent(event)));
  }

  /** Everything this seller has uploaded, product-linked or not. */
  mine(): Observable<MediaRef[]> {
    return this.http.get<MediaRef[]>(API.media.mine);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(API.media.byId(id));
  }

  private toUploadEvent(event: HttpEvent<MediaRef>): UploadEvent {
    if (event.type === HttpEventType.UploadProgress) {
      const value = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
      return { type: 'progress', value };
    }
    if (event.type === HttpEventType.Response && event.body) {
      return { type: 'done', media: event.body };
    }
    return { type: 'progress', value: 0 };
  }
}
