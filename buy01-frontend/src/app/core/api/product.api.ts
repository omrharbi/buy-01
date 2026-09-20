import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '../config/api.config';
import { Product, ProductInput } from '../models/product.model';

/**
 * The Product service. The two GETs are public; every write requires a seller token and is
 * checked against `sellerId` on the server — this class never decides ownership itself.
 */
@Injectable({ providedIn: 'root' })
export class ProductApi {
  private readonly http = inject(HttpClient);

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(API.products.list);
  }

  byId(id: string): Observable<Product> {
    return this.http.get<Product>(API.products.byId(id));
  }

  /** The signed-in seller's own catalog. */
  mine(): Observable<Product[]> {
    return this.http.get<Product[]>(API.products.mine);
  }

  create(input: ProductInput): Observable<Product> {
    return this.http.post<Product>(API.products.list, input);
  }

  update(id: string, input: ProductInput): Observable<Product> {
    return this.http.put<Product>(API.products.byId(id), input);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(API.products.byId(id));
  }
}
