import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  get<T>(path: string, auth = false): Observable<T> {
    return this.http.get<T>(`${this.base}${path}`, auth ? { headers: this.authHeaders() } : {});
  }

  post<T>(path: string, body: any, auth = false): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body, auth ? { headers: this.authHeaders() } : {});
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body, { headers: this.authHeaders() });
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.base}${path}`, body, { headers: this.authHeaders() });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`, { headers: this.authHeaders() });
  }

  uploadFile<T>(path: string, formData: FormData): Observable<T> {
    // Do NOT set Content-Type — browser must set it with the multipart boundary
    const token = localStorage.getItem('token');
    return this.http.post<T>(`${this.base}${path}`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
}
