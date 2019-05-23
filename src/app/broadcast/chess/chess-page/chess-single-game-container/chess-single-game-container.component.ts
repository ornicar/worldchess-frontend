import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import * as forRoot from '../../../../reducers';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../shared/decorators/observable-input';
import { IBoard } from '../../../core/board/board.model';
import { ITour } from '../../../core/tour/tour.model';
import { Tournament } from '../../../core/tournament/tournament.model';
import { ChessBoardViewMode } from '../chess-board/chess-board.component';
import { IGameState } from '../game/game.model';
import { selectGameState } from '../game/game.selectors';

@Component({
  selector: 'wc-chess-single-game-container',
  templateUrl: './chess-single-game-container.component.html',
  styleUrls: ['./chess-single-game-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessSingleGameContainerComponent implements OnChanges {

  @Input()
  tournament: Tournament;

  @Input()
  tour: ITour;

  @Input()
  isMinimalMode = false;

  @Input()
  board: IBoard;

  @Input()
  withoutBoard: boolean;

  @OnChangesInputObservable()
  board$ = new BehaviorSubject<IBoard>(this.board);

  private selectGameState = selectGameState();

  gameState$: Observable<IGameState> = this.board$.pipe(
    switchMap(board => this.store$.pipe(
      select(this.selectGameState, { boardId: board ? board.id : null })
      )
    ),
    shareReplay(1)
  );

  ChessBoardViewMode = ChessBoardViewMode;

  constructor(
    private store$: Store<forRoot.State>
  ) {
  }

  @OnChangesObservable()
  ngOnChanges() {
  }
}
