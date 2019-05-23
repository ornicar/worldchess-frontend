import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {TourResourceService} from './tour-resource.service';
import {AddTour, AddTours, GetTour, GetTours, GetToursByTournament, LoadTours, TourActionTypes} from './tour.actions';


@Injectable()
export class TourEffects {

  constructor(
    private actions$: Actions,
    private tourResource: TourResourceService) {}

  @Effect()
  tour$: Observable<Action> = this.actions$.pipe(
    ofType<GetTour>(TourActionTypes.GetTour),
    map((action: GetTour) => action.payload.id),
    switchMap(id =>
      this.tourResource.getWithDefaults(id).pipe(
        map(({tour}) => new AddTour({ tour }))
      )
    )
  );

  @Effect()
  tours$: Observable<Action> = this.actions$.pipe(
    ofType<GetTours>(TourActionTypes.GetTours),
    switchMap(() =>
      this.tourResource.getAll().pipe(
        map(tours => new LoadTours({ tours }))
      )
    )
  );

  @Effect()
  toursByTournament$: Observable<Action> = this.actions$.pipe(
    ofType<GetToursByTournament>(TourActionTypes.GetToursByTournament),
    map((action: GetToursByTournament) => action.payload.id),
    switchMap(id =>
      this.tourResource.getByTournament(id).pipe(
        map(tours => new AddTours({ tours }))
      )
    )
  );
}
