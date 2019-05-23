import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';

import * as moment from 'moment';
import {CookieService} from 'ngx-cookie';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

const FIRST_VISIT_FLAG_NAME = 'is-first-visit';

@Injectable()
export class UserService {

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService
  ) {
  }

  subscribeNonAuth(email: string): Observable<void> {
    let params = new HttpParams();
    params = params.set('email', email);
    return this.httpClient.put<void>(`${environment.restServer}/api/utils/subscribe`, {}, {
      params: params
    });
  }

  isFirstVisit() {
    return !this.cookieService.get(FIRST_VISIT_FLAG_NAME);
  }

  saveFirstVisit() {
    const expires = moment().add(1, 'year').toDate();
    this.cookieService.put(FIRST_VISIT_FLAG_NAME, '1', {expires});
  }
}
