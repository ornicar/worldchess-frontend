import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap, take, withLatestFrom } from 'rxjs/operators';
import * as fromRoot from '../../../../../../reducers';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../../../shared/decorators/observable-input';
import { IBoard } from '../../../../../core/board/board.model';
import { Tournament } from '../../../../../core/tournament/tournament.model';
import { AddBoardsToFavorite, RemoveBoardsFromFavorite } from '../../../../../favorite-boards/favorite-boards.actions';
import {
  selectCanUseFavorites,
  selectFavoriteBoardsIds,
  selectFavoriteBoardsIsLoading
} from '../../../../../favorite-boards/favorite-boards.reducer';
import { ChessBoardViewMode } from '../../../chess-board/chess-board.component';
import { IGameState } from '../../../game/game.model';
import { selectGameState } from '../../../game/game.selectors';

export enum ChessBoardGridItemViewMode {
  Normal,
  Medium
}

@Component({
  selector: 'wc-chess-board-grid-item',
  templateUrl: './chess-board-grid-item.component.html',
  styleUrls: ['./chess-board-grid-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessBoardGridItemComponent implements OnChanges {

  @Input()
  private viewMode: ChessBoardGridItemViewMode = ChessBoardGridItemViewMode.Normal;

  public chessBoardViewMode = {
    [ChessBoardGridItemViewMode.Normal]: ChessBoardViewMode.MultiboardNormal,
    [ChessBoardGridItemViewMode.Medium]: ChessBoardViewMode.MultiboardMedium,
  };

  @Input()
  @HostBinding('class.selected')
  isSelected = false;

  @Input()
  tournament: Tournament;

  @Input()
  board: IBoard;

  @OnChangesInputObservable()
  board$ = new BehaviorSubject<IBoard>(this.board);

  canUseFavorites$ = this.store$.pipe(select(selectCanUseFavorites));

  isFavorites$ = combineLatest([this.board$, this.store$.pipe(select(selectFavoriteBoardsIds))]).pipe(
    map(([board, ids]) => ids.includes(board.id))
  );

  favoriteBoardsIsLoading$ = this.store$.pipe(select(selectFavoriteBoardsIsLoading));

  private selectGameState = selectGameState();

  gameState$: Observable<IGameState> = this.board$.pipe(
    switchMap(board => this.store$.pipe(
      select(this.selectGameState, { boardId: board ? board.id : null })
      )
    ),
    shareReplay(1)
  );

  readonly orientation = 'white';

  @HostBinding('class.hover')
  public isHovered = false;

  @HostBinding('class.grid-view-mode--normal')
  get viewModeIsOnlyBoard() {
    return this.viewMode === ChessBoardGridItemViewMode.Normal;
  }

  @HostBinding('class.grid-view-mode--medium')
  get viewModeIsWidgetVertical() {
    return this.viewMode === ChessBoardGridItemViewMode.Medium;
  }

  public get currentViewMode(): ChessBoardGridItemViewMode {
    return this.isSelected ? ChessBoardGridItemViewMode.Normal : this.viewMode;
  }

  public containerPositionClasses: string[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private element: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private store$: Store<fromRoot.State>
  ) {
  }

  private recalculatePositions() {
    const containerPositionClasses = [];
    const item = this.element.nativeElement;
    const area = this.renderer.selectRootElement('wc-chess-boards-area', true);

    if (item && area) {
      const itemRect = item.getBoundingClientRect();
      const areaRect = area.getBoundingClientRect();
      const diff = Math.ceil((400 - itemRect.width) / 2);

      if ((itemRect.left - areaRect.left) <= diff) {
        containerPositionClasses.push(item, 'board-container--position-x--left');
      } else if ((areaRect.right - itemRect.right) <= diff) {
        containerPositionClasses.push(item, 'board-container--position-x--right');
      } else {
        containerPositionClasses.push(item, 'board-container--position-x--center');
      }

      if ((itemRect.top - areaRect.top) <= diff) {
        containerPositionClasses.push(item, 'board-container--position-y--top');
      } else if ((areaRect.bottom - itemRect.bottom) <= diff) {
        containerPositionClasses.push(item, 'board-container--position-y--bottom');
      } else {
        containerPositionClasses.push(item, 'board-container--position-y--center');
      }
    }

    this.containerPositionClasses = containerPositionClasses;
    this.cd.markForCheck();
  }

  @HostListener('mouseenter')
  private onMouseEnter() {
    this.isHovered = true;
    this.cd.markForCheck();
  }

  @HostListener('mouseleave')
  private onMouseLeave() {
    this.isHovered = false;
    this.cd.markForCheck();
  }

  @HostListener('touchend')
  private onMouseClick() {
    this.isHovered = true;
    this.cd.markForCheck();
  }


  onToggleFavorite(e) {
    this.isFavorites$.pipe(
      withLatestFrom(this.favoriteBoardsIsLoading$),
      take(1)
    ).subscribe(([isFavorites, isLoading]) => {
      if (!isLoading) {
        e.preventDefault();
        e.stopPropagation();

        this.store$.dispatch(isFavorites
          ? new RemoveBoardsFromFavorite({ boardsIds: [this.board.id] })
          : new AddBoardsToFavorite({ boardsIds: [this.board.id] })
        );
      }
    });
  }

  @OnChangesObservable()
  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges.isSelected
      && simpleChanges.isSelected.currentValue
      && this.viewMode !== ChessBoardGridItemViewMode.Normal
    ) {
      this.recalculatePositions();
    }
  }
}
