import { Injectable } from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {EMPTY, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import {AuthActionTypes, AuthLogout} from '../../auth/auth.actions';

import {
  ClearPredictedMove,
  DisableAutoSelectMove,
  EnableAutoSelectMove,
  MoveActionTypes,
  SetPredictedMove,
  SetSelectedMove
} from '../move/move.actions';
import {VariationMoveResourceService} from './variation-move-resource.service';
import {
  ActivateVariationMoves,
  ClearSelectedVariationMove,
  CreateVariationMove,
  DeactivateVariationMoves, SetSelectedVariationMove,
  SetVariationMove, UpdateVariationMove,
  VariationMoveActionTypes
} from './variation-move.actions';

@Injectable()
export class VariationMoveEffects {

  constructor(
    private actions$: Actions,
    private variationMoveResource: VariationMoveResourceService
  ) {}

  @Effect()
  createVariationMove$: Observable<Action> = this.actions$.pipe(
    ofType<CreateVariationMove>(VariationMoveActionTypes.CreateVariationMove),
    map((action) => {
      const {moveId, movePosition} = action.payload;

      const variationMove = {
        primary_key: uuidv4() as string,
        move: moveId,
        move_number: movePosition.move_number,
        is_white_move: movePosition.is_white_move,
        fen: movePosition.fen,
        san: movePosition.san,
        stockfish_score: null,
        prediction: []
      };

      return new SetVariationMove({ variationMove });
    })
  );

  @Effect()
  selectMove$: Observable<Action> = this.actions$.pipe(
    ofType<SetSelectedMove>(MoveActionTypes.SetSelectedMove),
    map((action) =>
      new ClearSelectedVariationMove({ moveId: action.payload.id })
    )
  );

  @Effect()
  selectPredictedMove$: Observable<Action> = this.actions$.pipe(
    ofType<SetPredictedMove>(MoveActionTypes.SetPredictedMove),
    switchMap(({ payload: { variationMoveId, moveId } }) => variationMoveId
      ? EMPTY
      : of(new ClearSelectedVariationMove({ moveId }))
    )
  );

  @Effect()
  clearPredictedMove$: Observable<Action> = this.actions$.pipe(
    ofType<SetSelectedVariationMove>(VariationMoveActionTypes.SetSelectedVariationMove),
    map(() => new ClearPredictedMove())
  );

  @Effect()
  loadPredicted$: Observable<Action> = this.actions$.pipe(
    ofType<SetVariationMove>(VariationMoveActionTypes.SetVariationMove),
    switchMap(({ payload: { variationMove } }) => this.variationMoveResource.getPrediction(variationMove)),
    map((variationMoveResponse) => {

      return new UpdateVariationMove({ variationMove: {id: variationMoveResponse.primary_key, changes: variationMoveResponse} });
    })
  );

  @Effect()
  deactivateVariationMoves$: Observable<Action> = this.actions$.pipe(
    ofType<AuthLogout>(AuthActionTypes.Logout),
    map(() => new DeactivateVariationMoves())
  );

  @Effect()
  disableAutoSelect$: Observable<Action> = this.actions$.pipe(
    ofType<ActivateVariationMoves>(VariationMoveActionTypes.ActivateVariationMoves),
    map(() => new DisableAutoSelectMove())
  );

  @Effect()
  enableAutoSelect$: Observable<Action> = this.actions$.pipe(
    ofType<DeactivateVariationMoves>(VariationMoveActionTypes.DeactivateVariationMoves),
    map(() => new EnableAutoSelectMove())
  );
}
