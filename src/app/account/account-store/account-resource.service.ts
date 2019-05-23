import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {pluck} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {IAccount, IAccountRating} from './account.model';

@Injectable()
export class AccountResourceService {

  constructor(private httpClient: HttpClient) { }

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

  getRating(): Observable<IAccountRating> {
    return this.httpClient.get<IAccountRating>(
      `${environment.endpoint}/me/ratings/`
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
}
