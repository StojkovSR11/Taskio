import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = 'http://localhost/taskio';
  private readonly checkEmailUrl = `${this.baseUrl}/check-email`;
  private readonly resetPasswordUrl = `${this.baseUrl}/reset-password`;

  constructor(private http: HttpClient) {}

  checkUsernameExists(username: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-username?username=${username}`);
  }

  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.checkEmailUrl}?email=${email}`);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(this.resetPasswordUrl, { email }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  checkUserActive(email: string): Observable<{ active: boolean }> {
    return this.http.get<{ active: boolean }>(`${this.baseUrl}/api/check-user-active?email=${email}`)
      .pipe(
        catchError(error => {
          console.error('Error checking user active status:', error);
          return throwError(error);
        })
      );
  }

  getUserById(userId: string): Observable<any> {
    const url = `${this.baseUrl}/users/${userId}`;
    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(error);
      })
    );
  }

  getUsers(): Observable<any[]> {
    const url = `${this.baseUrl}/users`;
    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(error);
      })
    );
  }

  changePassword(userId: string, changePasswordData: { oldPassword: string, newPassword: string }): Observable<any> {
    const url = `${this.baseUrl}/users/${userId}/change-password`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(url, changePasswordData, { headers });
  }
  getActiveUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/active`);
  }
  loginWithMagic(email: string, username: string): Observable<any> {
    const requestBody = { email, username };

    return this.http.post<any>(`${this.baseUrl}/send-magic-link`, requestBody);
  }
  loginWithMagicLink(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/send-magic-link?email=${email}`, {});
  }
  loginMagicLink(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/verify-magic-link?token=${token}`, {});
  }
  deactivateUser(userId: string): Observable<any> {
    const url = `${this.baseUrl}/users/${userId}/deactivate`;
    return this.http.put<any>(url, null);
  }
  
}
