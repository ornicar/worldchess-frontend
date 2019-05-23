import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import { ICamera } from './camera.model';
import * as fromRoot from '@app/reducers';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { switchMap, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class CameraResourceService {

  isAuthorized$: Observable<boolean> = this.store$.pipe(
    select(selectIsAuthorized),
  );

  constructor(private http: HttpClient,
              private store$: Store<fromRoot.State>) { }

  get(tourId: number) {
    return this.isAuthorized$.pipe(
      take(1),
      switchMap((isAuthorized: boolean) => {
        return isAuthorized
          ? this.http.get<ICamera[]>(`${environment.endpoint}/cameras/?tour=${tourId}&t=${(new Date()).getTime()}`)
          : this.http.get<ICamera[]>(`${environment.endpoint}/cameras/?tour=${tourId}`);
      }),
    );
  }
}
