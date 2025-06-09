import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { User } from '../../model/user.model';

export interface CvFile {
  id: number;
  fileName: string;
  createdAt: string; // lub Date w zależności od odpowiedzi backendu
  downloadUrl: string;
  thumbnailUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';
  private http = inject(HttpClient);
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  isLoggedIn = this.loggedIn.asObservable();

  private hasToken(): boolean {
    return !!sessionStorage.getItem('token');
  }

  private getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  uploadCv(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('cvFile', file);
    formData.append('userId', userId.toString());

    const headers = this.getAuthHeaders();

    return this.http.post('http://localhost:8080/api/cvfile/uploadPdf', formData, {
      headers,
    });
  }


  login(loginRequest: { emailOrUsername: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginRequest, {
      headers: { 'Content-Type': 'application/json' },
    }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('username', response.username);
          sessionStorage.setItem('userId', response.userId);
          sessionStorage.setItem('role', response.role);
          this.loggedIn.next(true);
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.loggedIn.next(false);
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email });
  }

  changePassword(token: string, newPassword: string): Observable<any> {
    const body = { token, newPassword };
    return this.http.post(`${this.apiUrl}/change-password`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() });
  }

  getUserCvs(userId: string): Observable<any> {
    return this.http.get<CvFile[]>(`http://localhost:8080/api/cvfile/list/${userId}`, { headers: this.getAuthHeaders() });
  }

  deleteCv(cvId: string): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/cvfile/delete/${cvId}`, { headers: this.getAuthHeaders(),responseType:'text' });
  }
}
