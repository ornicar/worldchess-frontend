import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {SetSelectedVariationMove} from '../../variation-move.actions';
import {IVariationMove, IVariationMovesPair} from '../../variation-move.model';
import * as fromVariationMove from '../../variation-move.reducer';

@Component({
  selector: 'wc-variation-moves',
  templateUrl: './variation-moves.component.html',
  styleUrls: ['./variation-moves.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariationMovesComponent implements OnInit {

  @Input() variationMoves: IVariationMovesPair[] = [];

  @Input() selectedVariationMove: IVariationMove;

  constructor(private store$: Store<fromVariationMove.State>) { }

  ngOnInit() {
  }

  onChange(variationMove) {
    this.store$.dispatch(new SetSelectedVariationMove({ variationMove }));
  }

  trackByVariationMove(index, item) {
    return item;
  }
}
