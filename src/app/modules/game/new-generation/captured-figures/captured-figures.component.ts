import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { blackFigureWeights, TFigure } from '@app/shared/widgets/chessground/figure.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { BehaviorSubject, Observable } from 'rxjs';

interface CountedFigure {
  figure: TFigure;
  count: number;
}

@Component({
  selector: 'captured-figures',
  templateUrl: 'captured-figures.component.html',
  styleUrls: ['captured-figures.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapturedFiguresComponent implements OnChanges {

  @Input()
  public capturedFigures: TFigure[];

  @Input()
  public capturedFigureColor: ChessColors;

  @Input()
  public materialAdvantage: number;

  @Input()
  public needSqueeze: boolean;

  @Output()
  toggleFigures = new EventEmitter<boolean>();

  sortedAndCountedFigures$: BehaviorSubject<CountedFigure[]> = new BehaviorSubject([]);
  needSqueeze$ = new BehaviorSubject(false);
  figuresCollapsed$ = new BehaviorSubject(false);

  uniquerSortedCapturedFigures(figures: TFigure[]): CountedFigure[] {
    if (!figures || figures.length === 0) {
      return [];
    }

    return Array.from(new Set(figures))
      .sort((figureA, figureB) => {
        return blackFigureWeights[figureA] < blackFigureWeights[figureB]
          ? 1
          : (blackFigureWeights[figureA] === blackFigureWeights[figureB]
            ? (figureA === 'n' ? 1 : -1) // слон отображается перед конём
            : -1);
        })
      .map((figure: TFigure) => {
        return {
          figure: figure,
          count: figures.filter((f) => f === figure).length
        };
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['capturedFigures'] && changes['capturedFigures'].currentValue) {
      this.sortedAndCountedFigures$.next(this.uniquerSortedCapturedFigures(changes['capturedFigures'].currentValue));
    }
    if (changes['needSqueeze'] && changes['needSqueeze'].currentValue) {
      this.needSqueeze$.next(changes['needSqueeze'].currentValue && this.capturedFigures && this.capturedFigures.length > 0);
      if (changes['needSqueeze'].currentValue
          && !changes['needSqueeze'].previousValue
          && this.capturedFigures
          && this.capturedFigures.length > 0) {
        this.figuresCollapsed$.next(true);
      }
    }
  }

  takenFiguresToggle() {
    this.figuresCollapsed$.next(!this.figuresCollapsed$.value);
    this.toggleFigures.emit(this.figuresCollapsed$.value);
  }
}
