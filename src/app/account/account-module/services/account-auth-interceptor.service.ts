import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthResourceService } from '../../../auth/auth-resource.service';
import { AuthLogout } from '../../../auth/auth.actions';
import { selectRefreshLoading, selectToken } from '../../../auth/auth.reducer';
import * as fromRoot from '../../../reducers';


@Injectable()
export class AccountAuthInterceptorService implements HttpInterceptor {

  private selectTokenAndRefreshingStatus = createSelector(
    selectToken,
    selectRefreshLoading,
    (token, refreshing) => ({ token, refreshing })
  );

  constructor(
    private store$: Store<fromRoot.State>,
    private authResource: AuthResourceService) {
  }

  private getToken(): Observable<string> {
    return this.store$.pipe(
      select(this.selectTokenAndRefreshingStatus),
      // wait all request when token refreshed.
      filter(({ token, refreshing }) => !refreshing),
      map(({ token }) => token),
      first()
    );
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isNotBroadcast = request.url.indexOf(environment.endpoint) === -1;
    const isJWT = request.url.indexOf(this.authResource.JWT_ENDPOINT) !== -1;

    if (isNotBroadcast || isJWT) {
      return next.handle(request);
    } else {
      // Add the token if exist.
      return this.getToken().pipe(mergeMap(token => {
        if (token) {
          const setHeaders = {
            'Authorization': `JWT ${token}`
          };

          return next.handle(request.clone({ setHeaders })).pipe(
            // logout when token has expired.
            tap(null, error => error.status === 401 && this.store$.dispatch(new AuthLogout()))
          );
        } else {
          return next.handle(request);
        }
      }));
    }
  }
}
