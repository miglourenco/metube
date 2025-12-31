import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';

export interface AuthStatus {
  auth_enabled: boolean;
  authenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private authStatusSubject = new BehaviorSubject<AuthStatus | null>(null);

  authStatus$ = this.authStatusSubject.asObservable();

  private getBaseUrl(): string {
    return `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '/')}`;
  }

  checkAuthStatus(): Observable<AuthStatus> {
    return this.http.get<AuthStatus>(`${this.getBaseUrl()}auth/status`).pipe(
      map(status => {
        this.authStatusSubject.next(status);
        return status;
      }),
      catchError(() => {
        const status: AuthStatus = { auth_enabled: false, authenticated: true };
        this.authStatusSubject.next(status);
        return of(status);
      })
    );
  }

  logout(): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.getBaseUrl()}logout`, {}).pipe(
      map(response => {
        if (response.status === 'ok') {
          window.location.href = `${this.getBaseUrl()}login`;
        }
        return response;
      })
    );
  }

  isAuthEnabled(): boolean {
    return this.authStatusSubject.value?.auth_enabled ?? false;
  }
}
