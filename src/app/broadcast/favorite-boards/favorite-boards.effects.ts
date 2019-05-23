import {HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {catchError, distinctUntilChanged, filter, map, mergeMap, switchMap, take, withLatestFrom} from 'rxjs/operators';
import {selectIsAuthorized} from '../../auth/auth.reducer';
import * as fromRoot from '../../reducers';
import {FavoriteBoardsResourceService} from './favorite-boards-resource.service';
import {
  AddBoardsToFavorite,
  GetFavoriteBoardsError,
  FavoriteBoardsActionTypes,
  GiveAccessFavoriteBoards,
  InitFavoriteBoards,
  GetFavoriteBoardsSuccess,
  RemoveBoardsFromFavorite,
  ResetFavoriteBoards,
  RestrictAccessFavoriteBoards,
  SetFavoriteBoardsDocumentStatus,
  GetFavoriteBoards,
  UpdateFavoriteBoards
} from './favorite-boards.actions';
import {
  FavoriteBoardsDocumentStatus,
  selectCanUseFavorites,
  selectFavoriteBoardsIds,
  selectFavoriteBoardsStore
} from './favorite-boards.reducer';

@Injectable()
export class FavoriteBoardsEffects {

  private favoriteBoardsIds$ = this.store$.pipe(
    select(selectFavoriteBoardsIds),
    take(1)
  );

  private favoriteBoardsDocumentStatus$ = this.store$.pipe(
    select(selectFavoriteBoardsStore),
    map(({ documentStatus }) => documentStatus),
    take(1)
  );

  constructor(
    private actions$: Actions,
    private store$: Store<fromRoot.State>,
    private favoriteBoardsResource: FavoriteBoardsResourceService
  ) {
  }

  @Effect()
  checkAccess$: Observable<Action> = this.store$.pipe(
    select(selectIsAuthorized),
    distinctUntilChanged(),
    withLatestFrom(this.store$.pipe(select(selectCanUseFavorites))),
    mergeMap(([isAuthorized, canUseFavorites]) => {
      const actions: Action[] = [];

      if (isAuthorized) {
        actions.push(new GiveAccessFavoriteBoards());
        // When logout.
      } else if (canUseFavorites) {
        actions.push(
          new RestrictAccessFavoriteBoards(),
          new ResetFavoriteBoards()
        );
      }

      return fromArray(actions);
    })
  );

  @Effect()
  init$ = this.actions$.pipe(
    ofType<InitFavoriteBoards>(FavoriteBoardsActionTypes.InitFavoriteBoards),
    switchMap(() => this.favoriteBoardsDocumentStatus$),
    filter(documentStatus => documentStatus === FavoriteBoardsDocumentStatus.NotLoaded),
    map(() => new GetFavoriteBoards())
  );

  @Effect()
  getFavoriteBoards$ = this.actions$.pipe(
    ofType<GetFavoriteBoards>(FavoriteBoardsActionTypes.GetFavoriteBoards),
    switchMap(() =>
      this.favoriteBoardsResource.get().pipe(
        mergeMap(({ boards: {all: boardsIds} }) => fromArray([
          new GetFavoriteBoardsSuccess({ boardsIds }),
          new SetFavoriteBoardsDocumentStatus({ documentStatus: FavoriteBoardsDocumentStatus.Created })
        ])),
        catchError((e: HttpErrorResponse) => {
          const actions: Action[] = [new GetFavoriteBoardsError()];

          if (e && e.status === 404) {
            actions.push(new SetFavoriteBoardsDocumentStatus({ documentStatus: FavoriteBoardsDocumentStatus.NotCreated }));
          } else {
            console.error(e);
          }

          return fromArray(actions);
        })
      )
    )
  );

  @Effect()
  addBoardsToFavorite$ = this.actions$.pipe(
    ofType<AddBoardsToFavorite>(FavoriteBoardsActionTypes.AddBoardsToFavorite),
    switchMap(({ payload: { boardsIds }}) => this.favoriteBoardsIds$.pipe(
      map(favoriteBoardsIds => favoriteBoardsIds.concat(boardsIds))
    )),
    map(boardsIds => new UpdateFavoriteBoards({boardsIds}))
  );

  @Effect()
  removeBoardsFromFavorite$ = this.actions$.pipe(
    ofType<RemoveBoardsFromFavorite>(FavoriteBoardsActionTypes.RemoveBoardsFromFavorite),
    switchMap(({ payload: { boardsIds }}) => this.favoriteBoardsIds$.pipe(
      map(favoriteBoardsIds => favoriteBoardsIds.filter(id => !boardsIds.includes(id)))
    )),
    map(boardsIds => new UpdateFavoriteBoards({boardsIds}))
  );

  @Effect()
  updateFavoriteBoards$ = this.actions$.pipe(
    ofType<UpdateFavoriteBoards>(FavoriteBoardsActionTypes.UpdateFavoriteBoards),
    switchMap(({ payload: { boardsIds: ids }}) =>
      this.favoriteBoardsDocumentStatus$.pipe(
        switchMap(documentStatus => documentStatus === FavoriteBoardsDocumentStatus.Created
          ? this.favoriteBoardsResource.update(ids).pipe(
            map(({ boards: {all: boardsIds} }) => new GetFavoriteBoardsSuccess({ boardsIds })),
          )
          : this.favoriteBoardsResource.create(ids).pipe(
            mergeMap(({ boards: {all: boardsIds} }) => fromArray([
              new GetFavoriteBoardsSuccess({ boardsIds }),
              new SetFavoriteBoardsDocumentStatus({ documentStatus: FavoriteBoardsDocumentStatus.Created })
            ])),
          )
        ),
        catchError(e => {
          console.error(e);

          return of(new GetFavoriteBoardsError());
        })
      )
    )
  );
}
