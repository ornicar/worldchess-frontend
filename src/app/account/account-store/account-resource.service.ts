import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, distinct, finalize, map, pluck, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IAccount, IAccountRating, FounderStatus, IAccountEmailChange, IAddFriend, IFriend, IExistFriend } from './account.model';
import { IFounderCamera } from '@app/broadcast/core/camera/camera.model';

@Injectable()
export class AccountResourceService {

  constructor(private httpClient: HttpClient) { }

  private _responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});

  getProfile(): Observable<IAccount> {
    return this.httpClient.get<IAccount>(
      `${environment.endpoint}/me/`
    );
  }

  updateProfile(account: Partial<IAccount>) {
    return this.httpClient.patch<IAccount>(
      `${environment.endpoint}/me/`,
      account
    );
  }

  deleteProfile() {
    return this.httpClient.delete<IAccount>(
      `${environment.endpoint}/me/i-want-to-break-free/`
    );
  }

  getRating(): Observable<IAccountRating> {
    return this.httpClient.get<IAccountRating>(
      `${environment.endpoint}/me/ratings/`
    );
  }

  changeEmail(newEmail: string): Observable<any> {
    return this.httpClient.post(
      `${environment.endpoint}/me/request-email-change/`,
      { new_email: newEmail }
    );
  }

  confirmEmailChange(code: string, email: string): Observable<IAccountEmailChange> {
    return this.httpClient.patch<IAccountEmailChange>(
      `${environment.endpoint}/me/confirm-email-change/`,
      { email: email, verification_code: code }
    );
  }

  createFideId(): Observable<number> {
    return this.httpClient.post<{ fide_id: number }>(
      `${environment.endpoint}/me/fide/`,
      { }
    ).pipe(
      pluck('fide_id')
    );

  }

  getFriends(): Observable<IFriend[]> {
    return this.httpClient.get(`${environment.endpoint}/me/friends/`)
      .pipe(
        take(1),
        catchError(({error}) => {
          this._responseErrors$.next(error);
          return of(null);
        })
      );
  }

  addFriend(user_id: number): Observable<IAddFriend> {
    return  this.httpClient.post(`${environment.endpoint}/me/friends/`, {friend_id: user_id})
      .pipe(
        take(1),
        catchError(({error}) => {
          this._responseErrors$.next(error);
          return of(null);
        })
      );
  }

  deleteFriend(user_id: number): Observable<any> {
    return this.httpClient.delete(`${environment.endpoint}/me/friends/${user_id}`)
    .pipe(
      catchError(({error}) => {
        this._responseErrors$.next(error);
        return of(null);
      })
    );
  }

  getIsFriends(user_id: number): Observable<boolean> {
    return this.httpClient.get(`${environment.endpoint}/me/friends/is_friend/?friend_id=${user_id}`)
    .pipe(
      take(1),
      map(i => i['result']),
      catchError(({error}) => {
        this._responseErrors$.next(error);
        return of(null);
      })
    );
  }

  getFounderCameras(tournamentId: number): Observable<IFounderCamera[]> {
    return this.httpClient.get<IFounderCamera[]>(
      `${environment.endpoint}/founder/tournaments/${tournamentId}/cameras/`
    );
  }

  createFounderCamera(tournamentId: number, data: any): Observable<IFounderCamera> {
    return this.httpClient.post<IFounderCamera>(
      `${environment.endpoint}/founder/tournaments/${tournamentId}/cameras/`,
      data
    );
  }

  requestFounserStatusApprovement(): Observable<any> {
    return this.httpClient.post(`${environment.endpoint}/me/organizer_status/`, { founder_approve_status: FounderStatus.WAIT });
  }

  cancelFounderStatus(): Observable<any> {
    return this.httpClient.delete(`${environment.endpoint}/me/organizer_status/`, {});
  }
}
