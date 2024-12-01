import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost/taskio/notifications';

  constructor(private http: HttpClient) { }

  // Funkcija za dobijanje notifikacija za korisnika
  getNotificationsByUserID(userID: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userID}`);
  }

  // Funkcija za dobijanje svih notifikacija
  getAllNotifications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`);
  }
}
