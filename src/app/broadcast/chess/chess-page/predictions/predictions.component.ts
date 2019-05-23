import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store} from '@ngrx/store';
import * as fromBoard from '../../../core/board/board.reducer';
import {SetPredictedMove} from '../../../move/move.actions';
import {IPredictPosition} from '../../../move/move.model';
import {IGameState} from '../game/game.model';

@Component({
  selector: 'wc-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PredictionsComponent {
  @Input() gameState: IGameState;

  get selectedMovePosition() {
    return this.gameState.selectedVariationMove || this.gameState.selectedMove;
  }

  constructor(private store$: Store<fromBoard.State>) {}

  onPredictionChange(predictPosition: IPredictPosition) {
    const { selectedMove, selectedVariationMove } = this.gameState;

    this.store$.dispatch(new SetPredictedMove({
      moveId: selectedMove.id,
      variationMoveId: selectedVariationMove ? selectedVariationMove.primary_key : null,
      predictPosition
    }));
  }
}
