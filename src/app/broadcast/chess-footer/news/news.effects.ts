import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {NewsResourceService} from './news-resource.service';
import {GetNewss, LoadNewss, NewsActionTypes} from './news.actions';


@Injectable()
export class NewsEffects {

  constructor(
    private actions$: Actions,
    private newsResource: NewsResourceService) { }

  @Effect()
  getNewss$: Observable<Action> = this.actions$.pipe(
    ofType<GetNewss>(NewsActionTypes.GetNewss),
    switchMap(() => this.newsResource.getAll()
      .pipe(map(newss => new LoadNewss({ newss })))
    )
  );
}
