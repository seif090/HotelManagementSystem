import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'hotel_management_token';
  private userSubject = new BehaviorSubject<any>(null);
  
  isAuthenticated = signal<boolean>(false);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkExistingToken();
  }

  private checkExistingToken(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.isAuthenticated.set(true);
      // Decode token to get user info (in real app, validate token)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userSubject.next(payload);
      } catch (e) {
        console.warn('Could not decode token');
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.setSession(response);
      }),
      catchError((error) => {
        this.showError(error?.error?.message || 'خطأ في تسجيل الدخول');
        return of(error);
      })
    );
  }

  // Mock login for demo
  mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    return new Observable((observer) => {
      setTimeout(() => {
        if (credentials.email === 'admin@hotel.com' && credentials.password === 'admin123') {
          const mockResponse: LoginResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIEhvdGVsIiwiZW1haWwiOiJhZG1pbkBob3RlbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTQyMjM2MDB9.sample',
            user: {
              id: '1',
              name: 'مدير النظام',
              email: credentials.email,
              role: 'admin'
            }
          };
          this.setSession(mockResponse);
          observer.next(mockResponse);
          observer.complete();
        } else {
          observer.error({ error: { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' } });
        }
      }, 1000);
    });
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    this.isAuthenticated.set(true);
    this.userSubject.next(response.user);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private showError(message: string): void {
    console.error(message);
  }
}
