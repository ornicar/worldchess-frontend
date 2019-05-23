import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, pluck, switchMap} from 'rxjs/operators';
import {GetWidgets, LoadWidgets, WidgetActionTypes} from './widget.actions';
import {IWidget, IWidgetResponseAllEntities, WidgetService} from './widget.service';


@Injectable()
export class WidgetEffects {

  constructor(
    private actions$: Actions,
    private widgetResource: WidgetService
  ) {}

  @Effect()
  widgets$: Observable<Action> = this.actions$.pipe(
    ofType<GetWidgets>(WidgetActionTypes.GetWidgets),
    switchMap(() =>
      this.widgetResource.getAllWithExpandAllWidgets().pipe(
        pluck<IWidgetResponseAllEntities, IWidget[]>('widgets'),
        map(widgets => new LoadWidgets({ widgets }))
      )
    )
  );
}
