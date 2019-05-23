import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {IUserNotificationMessage} from './notifications.model';

@Injectable()
export class NotificationsResourceService {

  constructor(
    private http: HttpClient
  ) {}

  getAll(): Observable<IUserNotificationMessage[]> {
    return this.http.get<IUserNotificationMessage[]>(`${environment.endpoint}/me/notifications/`);
  }

  markRead(id: number): Observable<void> {
    return this.http.post<void>(`${environment.endpoint}/me/notifications/${id}/mark_read/`, null);
  }

  markReadAll(): Observable<void> {
    return this.http.post<void>(`${environment.endpoint}/me/notifications/mark_all_read/`, null);
  }
}
