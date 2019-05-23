import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {pluck, switchMap, take, tap} from 'rxjs/operators';
import {IDefaultEntities} from '../models/default-entities';
import {TourResourceService} from './tour-resource.service';
import * as TourActions from './tour.actions';
import {ITour} from './tour.model';
import * as fromTour from './tour.reducer';

@Injectable()
export class TourLoadService {

  constructor(
    private store$: Store<fromTour.State>,
    private tourResource: TourResourceService) { }

  /**
   * Load from store or server.
   */
  getWhenLacking(id: number): Observable<ITour> {
    return this.store$.pipe(
      select(fromTour.selectEntities),
      take(1),
      switchMap(entities => entities[id]
        ? of(entities[id])
        : this.tourResource.getWithDefaults(id).pipe(
          pluck('tour'),
          tap((tour: ITour) => this.store$.dispatch(new TourActions.AddTour({ tour }))),
        )
      )
    );
  }

  getDefaults(id: number): Observable<IDefaultEntities> {
    return this.tourResource.getWithDefaults(id).pipe(
      pluck('defaults')
    );
  }
}
