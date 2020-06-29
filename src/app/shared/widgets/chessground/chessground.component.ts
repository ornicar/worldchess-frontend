import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output, SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as Chess from 'chess.js';
import { Chessground } from 'chessground';
import { Api as ChessgroundApi } from 'chessground/api';
import { Config as ChessgroundConfig } from 'chessground/config';
import * as ChessgroundType from 'chessground/types';
import { BehaviorSubject, fromEvent, interval, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, startWith, take, throttleTime, withLatestFrom } from 'rxjs/operators';
import { IMovePosition } from '../../../broadcast/move/move.model';
import { OnChangesInputObservable, OnChangesObservable } from '../../decorators/observable-input';
import { DomHelper } from '../../helpers/dom.helper';
import { SubscriptionHelper, Subscriptions } from '../../helpers/subscription.helper';
import { blackFigureWeights, CheckmateState, TFigure, whiteFigureWeights } from './figure.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { IGameMove } from '@app/modules/game/state/game-move.model';
import { ChessgroundAudioService } from '@app/shared/widgets/chessground/chessground.audio.service';

export interface IChessEngineMove {
  color: 'w' | 'b';
  flags: string;
  from: ChessgroundType.Key;
  to: ChessgroundType.Key;
  promotion?: string;
  san: string;
  piece: string;
  captured?: TFigure;
}

const lettersIndexWhite = {
  'a': 0,
  'b': 1,
  'c': 2,
  'd': 3,
  'e': 4,
  'f': 5,
  'g': 6,
  'h': 7
};
const lettersIndexBlack = {
  'a': 7,
  'b': 6,
  'c': 5,
  'd': 4,
  'e': 3,
  'f': 2,
  'g': 1,
  'h': 0
};

@Component({
  selector: 'wc-chessground',
  templateUrl: './chessground.component.html',
  styleUrls: ['./chessground.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessgroundComponent implements OnInit, OnChanges, AfterViewInit, AfterContentChecked, OnDestroy {

  @Input() position?: IMovePosition;
  @OnChangesInputObservable() position$ = new BehaviorSubject<IMovePosition>(this.position);

  @Input() selectedMove?: IGameMove;
  @OnChangesInputObservable() selectedMove$ = new BehaviorSubject<IGameMove>(this.selectedMove);

  @Input() orientation: ChessgroundType.Color = 'white';
  @OnChangesInputObservable('orientation') orientation$ = new BehaviorSubject<ChessgroundType.Color>(this.orientation);

  @Input() canCreateMove = false;
  @Input() redraw = false;
  @OnChangesInputObservable() redraw$ = new BehaviorSubject<boolean>(this.redraw);

  @HostBinding('class.movable')
  @Input() canMove = false;
  @OnChangesInputObservable() canMove$ = new BehaviorSubject<boolean>(this.canMove);

  @ViewChild('board', { read: ElementRef, static: true }) boardElement: ElementRef<HTMLElement>;

  @Input() enableAnimation = true;

  @Input() soundEnabled = false; // sounds
  @OnChangesInputObservable() soundEnabled$ = new BehaviorSubject<boolean>(this.soundEnabled);

  @Input() legalMove = false; // legal move
  @OnChangesInputObservable() legalMove$ = new BehaviorSubject<boolean>(this.legalMove);

  @Input() lastMove = 'highlight';
  @OnChangesInputObservable() lastMove$ = new BehaviorSubject<string>(this.lastMove);

  @Input()
  private reviewMode = false;
  @OnChangesInputObservable() reviewMode$ = new BehaviorSubject<boolean>(this.reviewMode);

  @Input()
  private boardIsFlipped = false;
  @OnChangesInputObservable() boardIsFlipped$ = new BehaviorSubject<boolean>(this.boardIsFlipped);

  @Output() positionChange = new EventEmitter<IMovePosition>();
  @Output() triedToMove = new EventEmitter<void>();

  @Output()
  public captured = new EventEmitter<IChessEngineMove[]>();

  @Output()
  public isCheck = new EventEmitter<boolean>();

  @Output()
  public isCheckmate = new EventEmitter<CheckmateState>();

  @Output()
  public isCheckmateReview = new EventEmitter<CheckmateState>();

  @Output()
  public forceChange = new EventEmitter<{whiteForce: number; blackForce: number}>();

  @Output()
  public promotionActive = new EventEmitter<boolean>();

  chessEngine: Chess;
  chessEngineReview: Chess;
  chessground: ChessgroundApi;

  isVisiblePromotionPopupLeft = false;
  isVisiblePromotionPopupRight = false;

  promotionMoves: IChessEngineMove[] = [];
  sortedPromotionMoves: IChessEngineMove[] = [];

  subs: Subscriptions = {};

  private animationStartTime = 0;

  private chessgroundDefaultConfig: ChessgroundConfig = {
    coordinates: false,
    resizable: true,
    draggable: {
      centerPiece: false,
      showGhost: true
    },
    highlight: {
      lastMove: true,
      check: true,
    },
    animation: {
      enabled: false,
      duration: 300
    },
  };

  lastUpdate = 0;

  private onElementResizeSubject = new Subject<number>();

  constructor(
    private ngZone: NgZone,
    private element: ElementRef<HTMLElement>,
    private cd: ChangeDetectorRef,
    private audioService: ChessgroundAudioService
  ) {}

  ngOnInit() {
    this.chessEngine = new Chess();
    this.chessEngineReview = new Chess();

    this.subs.position = this.position$
      .pipe(
        startWith(null),
        distinctUntilChanged((prev, next) => {
          const prevFen = prev && prev.fen,
            nextFen = next && next.fen;

          return prevFen === nextFen;
        }),
        pairwise(),
        withLatestFrom(this.reviewMode$)
      )
      .subscribe(([some, reviewMode]) => {
        const [prev, next] = some;
        this.updatePosition(next, reviewMode);
      });

    this.subs.selectedMove = this.selectedMove$.pipe(
      filter((selectedMove) => !!selectedMove)
    ).subscribe((selectedMove) => {
      this.updateReviewPosition(selectedMove);
    });

    this.subs.orientation = this.orientation$
      .subscribe(orientation => {
        if (this.chessground) {
          this.chessground.set({orientation: orientation});
          this.redrawChessground();
        }
      });

    this.subs.canMove = this.canMove$
      .subscribe(canMove => {
        if (this.chessground) {
          this.chessground.set({ movable: { color: canMove ? this.getChessTurnColor() : null } });
        }
      });

    this.ngZone.runOutsideAngular(() => {
      this.subs.onResize = fromEvent(
        window,
        'resize',
        DomHelper.isPassiveSupported() ? { passive: true } : undefined
      )
        .pipe(
          throttleTime(20, undefined, { leading: true, trailing: true }),
        )
        .subscribe(() => this.checkElementSize());

      this.subs.redraw = this.onElementResizeSubject
        .pipe(
          distinctUntilChanged(),
          throttleTime(20, undefined, { leading: true, trailing: true }),
          withLatestFrom(this.boardIsFlipped$)
        )
        .subscribe(([s, boardIsFlipped]) => {
          if (this.chessground) {
            this.redrawChessground(boardIsFlipped);
          }
        });
    });

    this.redraw$.subscribe((redraw) => {
      if (redraw) {
        this.redrawChessground();
      }
    });

    this.subs.boardFlipped = this.boardIsFlipped$.subscribe(
      (boardIsFlipped) => {
        if (boardIsFlipped) {
          this.redrawChessground(true);
        } else {
          this.redrawChessground(false);
        }
      }
    );
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges) {
    if (changes['reviewMode']) {
      if (!changes['reviewMode'].currentValue) {
        if (this.chessground) {
          this.updateChessground(true);
        }
      }
    }
    if (changes['legalMove']) {
      if (!changes['legalMove'].currentValue) {
        this.updateChessground(false);
      }
    }

    if (changes['lastMove'] ) {
      if (!changes['lastMove'].currentValue) {
        this.updateChessground(false);
      }
    }
  }

  ngAfterViewInit() {
    this.initializeChessground();
  }

  ngAfterContentChecked() {
    this.checkElementSize();
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);

    if (this.chessground) {
      this.chessground.destroy();
    }
  }

  private checkElementSize() {
    if (this.element.nativeElement) {
      this.ngZone.runOutsideAngular(() => {
        interval(10).pipe(
          startWith(0),
          take(20),
          map(() => this.element.nativeElement.offsetWidth * this.element.nativeElement.offsetHeight),
          distinctUntilChanged(),
        ).subscribe((s) => {
          this.onElementResizeSubject.next(s);
        });
      });
    }
  }

  private getChessPossibleMoves(): { [key: string]: ChessgroundType.Key[] } {
    const dests = {};

    this.chessEngine.SQUARES.forEach(square => {
      const moves = this.chessEngine.moves({square: square, verbose: true});

      if (moves.length) {
        dests[square] = moves.map(move => move.to);
      }
    });

    return dests;
  }

  private getChessLastMove(): ChessgroundType.Key[] {
    const lastMove = this.chessEngine.history({ verbose: true }).pop();

    return lastMove ? [lastMove.from, lastMove.to] : [];
  }

  private getChessTurnColor(): ChessgroundType.Color {
    return this.chessEngine.turn() === 'b' ? 'black' : 'white';
  }

  private getHiglight(): boolean {
    return (this.lastMove === 'non_showing') ? false : true;
  }

  private getHiglightCheck(): boolean {
    if (this.getHiglight()) {
      // TODO: Если будет добавленная стрелка `arrow` то тут надо будет добавить if-then-else.
      return true;
    } else {
      return false;
    }
  }

  private initializeChessground(): void {
    const viewConfig: ChessgroundConfig = {
      ...this.chessgroundDefaultConfig,
      check: this.chessEngine.in_check(),
      orientation: this.orientation,
      fen: this.chessEngine.fen(),
      turnColor: this.getChessTurnColor(),
      lastMove: this.getChessLastMove(),
      viewOnly: false,
      highlight: {
        lastMove: this.getHiglight(),
      },
      movable: {
        free: false,
        color: this.canMove ? this.getChessTurnColor() : null,
        dests: this.getChessPossibleMoves(),
        showDests: this.legalMove,
        events: {
          after: this.onAfterMove.bind(this),
        },
      },
    };

    this.ngZone.runOutsideAngular(() => {
      this.chessground = Chessground(this.boardElement.nativeElement, viewConfig);
    });
    this.checkElementSize();
  }

  private updateChessground(enableAnimation = false) {
    // Disable animation if previous animation not completed.
    if (enableAnimation) {
      const currentTime = new Date().getTime();

      if (currentTime - this.animationStartTime <= this.chessgroundDefaultConfig.animation.duration) {
        this.animationStartTime = currentTime;
        enableAnimation = false;
      }
    }

    const animation = enableAnimation
      ? { enabled: this.enableAnimation }
      : this.chessgroundDefaultConfig.animation;

    if (this.chessEngine.in_check()) {
      this.isCheck.emit(true);
    } else {
      this.isCheck.emit(false);
    }

    if (this.chessEngine.in_checkmate()) {
      if (this.getChessTurnColor() === 'white') {
        this.isCheckmate.emit(CheckmateState.BlackCheckmates);
      } else {
        this.isCheckmate.emit(CheckmateState.WhiteCheckmates);
      }
    } else {
      this.isCheckmate.emit(CheckmateState.NoCheckmate);
    }

    this.ngZone.runOutsideAngular(() => {
      // Set animation settings.
      this.chessground.set({animation});

      // Set new board position.
      this.chessground.set({
        check: this.chessEngine.in_check(),
        orientation: this.orientation,
        fen: this.chessEngine.fen(),
        turnColor: this.getChessTurnColor(),
        lastMove: this.getChessLastMove(),
        highlight: {
          lastMove: this.getHiglight()
        },
        movable: {
          showDests: this.legalMove,
          color: this.canMove ? this.getChessTurnColor() : null,
          dests: this.getChessPossibleMoves()
        }
      });
    });

    this.checkElementSize();
  }

  updateChessgroundReview() {
    // Disable animation if previous animation not completed.
    let enableAnimation = true;
    if (enableAnimation) {
      const currentTime = new Date().getTime();

      if (currentTime - this.animationStartTime <= this.chessgroundDefaultConfig.animation.duration) {
        this.animationStartTime = currentTime;
        enableAnimation = false;
      }
    }

    if (this.chessEngineReview.in_checkmate()) {
      if (this.getChessTurnColor() === 'white') {
        this.isCheckmateReview.emit(CheckmateState.BlackCheckmates);
      } else {
        this.isCheckmateReview.emit(CheckmateState.WhiteCheckmates);
      }
    } else {
      this.isCheckmateReview.emit(CheckmateState.NoCheckmate);
    }

    const animation = enableAnimation
      ? { enabled: this.enableAnimation }
      : this.chessgroundDefaultConfig.animation;

    this.ngZone.runOutsideAngular(() => {
      // Set animation settings.
      this.chessground.set({animation});

      // Set new board position.
      this.chessground.set({
        check: this.chessEngineReview.in_check(),
        orientation: this.orientation,
        fen: this.chessEngineReview.fen(),
        turnColor: this.getChessTurnColor(),
        lastMove: this.getChessLastMove(),
        movable: {
          color: this.canMove ? this.getChessTurnColor() : null,
          dests: this.getChessPossibleMoves(),
          showDests: this.legalMove,
        }
      });
    });

    this.checkElementSize();
  }

  private redrawChessground(flipped = false) {
    // Recalculate figure positions.
    setTimeout(() => {
      this.ngZone.runOutsideAngular(() => {
          const prevRelative = this.chessground.state.dom.relative;
          const prevViewOnly =  this.chessground.state.viewOnly;
          const prevVisible =  this.chessground.state.drawable.visible;
          this.chessground.state.dom.relative = true;
          this.chessground.state.viewOnly = true;
          this.chessground.state.drawable.visible = false;
          this.chessground.redrawAll();
          const lastUpdate = Date.now();
          this.chessground.state.dom.relative = prevRelative;
          this.chessground.state.viewOnly = prevViewOnly;
          this.chessground.state.drawable.visible = prevVisible;
          this.lastUpdate = lastUpdate;
          setTimeout(() => {
            if (this.lastUpdate === lastUpdate) {
              this.ngZone.runOutsideAngular(() => {
                  this.chessground.state.dom.relative = flipped;
                  this.chessground.state.viewOnly = flipped;
                  this.chessground.state.drawable.visible = false;
                  this.chessground.redrawAll();
                }
              );
            }
          }, 100);
        }
      );
    }, 1);
  }

  private onAfterMove(from, to) {
    if (this.canCreateMove) {
      const moves = this.getLegalMoves(from, to);
      const selectMove = moves.some(m => Boolean(m.promotion))
        ? moves.find(m => m.promotion === 'q') // @todo. Select.
        : moves[0];

      if (moves.some(m => Boolean(m.promotion))) {
        this.promotionMoves = moves;
        // Block the move action.
        this.chessground.set({ movable: { color: null } });

        this.initPromotionPopup(to);
        this.promotionActive.emit(true);

        this.cd.markForCheck();
      } else {
        this.addNewPosition(selectMove.san);
      }
    } else {
      this.triedToMove.emit();
      // Reset move.
      this.updateChessground(false);
    }
  }

  initPromotionPopup(to: string) {
    let leftSideLetters: Set<string>;
    let letterIndex: number;
    if (this.orientation === ChessColors.White) {
      leftSideLetters = new Set(['a', 'b', 'c' , 'd']);
      letterIndex = lettersIndexWhite[to[0]];
    } else {
      leftSideLetters = new Set(['h', 'g', 'f' , 'e']);
      letterIndex = lettersIndexBlack[to[0]];
    }

    if (letterIndex > 3) {
      letterIndex -= 4;
    }

    this.sortedPromotionMoves = [];
    this.isVisiblePromotionPopupLeft = false;
    this.isVisiblePromotionPopupRight = false;

    this.sortedPromotionMoves.push(this.promotionMoves.find((move) => (move.promotion === 'n')));
    this.sortedPromotionMoves.push(this.promotionMoves.find((move) => (move.promotion === 'b')));
    this.sortedPromotionMoves.push(this.promotionMoves.find((move) => (move.promotion === 'r')));

    if (letterIndex === 3) {
      this.sortedPromotionMoves.push(this.promotionMoves.find((move) => (move.promotion === 'q')));
    } else {
      this.sortedPromotionMoves.splice(letterIndex, 0, this.promotionMoves.find((move) => (move.promotion === 'q')));
    }

    if (leftSideLetters.has(to[0])) {
      this.isVisiblePromotionPopupLeft = true;
    } else {
      this.isVisiblePromotionPopupRight = true;
    }
  }

  private getLegalMoves(from, to): IChessEngineMove[] {
    return this.chessEngine
      .moves({square: from, verbose: true})
      .filter(move => move.to === to);
  }

  private addNewPosition(san: string) {
    // Get the turn color before movement.
    const isWhite = this.getChessTurnColor() === 'white';

    // save new position.
    this.chessEngine.move(san);
    this.playMoveSound();

    const newPos: IMovePosition = {
      fen: this.chessEngine.fen(), // Get new FEN notation.
      san,
      move_number: this.position ? this.position.move_number + (isWhite ? 1 : 0) : 1,
      is_white_move: isWhite
    };

    this.ngZone.run(() => this.positionChange.emit(newPos));
  }

  private playMoveSound() {
    if (this.soundEnabled) {
      const history = this.chessEngine.history({verbose: true});
      const lastMove: IChessEngineMove = history ? history[history.length - 1] : {};
      if (lastMove) {
        if (lastMove.san === 'O-O'
            || lastMove.san === 'O-O-O') {
          this.audioService.playKnock().then(() => {
            this.audioService.playKnock();
          });
        } else {
          this.audioService.playKnock();
        }
      }
    }
  }

  updatePosition(position?: IMovePosition, reviewMode = false) {
    if (position) {
      if (this.chessEngine.turn() === 'w' && position.is_white_move
        || this.chessEngine.turn() === 'b' && !position.is_white_move) {
        this.chessEngine.move(position.san);
        this.playMoveSound();
      }

      if (this.chessEngine.fen() !== position.fen) {
        this.chessEngine.load(position.fen);
      }

    } else {
      this.chessEngine.reset();
    }

    if (this.chessground && !reviewMode) {
      this.updateChessground(true);
    }
    // TODO добавил условия, так как this.chessground становиться undefined, не понятно почему :-(
    // HOT-FIX
    if (this.chessEngine.in_checkmate() && !reviewMode && !this.chessground) {
      if (this.getChessTurnColor() === 'white') {
        this.isCheckmate.emit(CheckmateState.BlackCheckmates);
      } else {
        this.isCheckmate.emit(CheckmateState.WhiteCheckmates);
      }
    }

    if (this.promotionMoves.length) {
      this.promotionMoves = [];
      this.sortedPromotionMoves = [];
      this.isVisiblePromotionPopupLeft = false;
      this.isVisiblePromotionPopupRight = false;
      this.cd.markForCheck();
    }

    const fen_figures = this.chessEngine.fen().split(' ')[0];
    let blackForce = 0;
    let whiteForce = 0;

    Object.keys(blackFigureWeights).forEach((blackFigure) => {
      blackForce += (fen_figures.match(new RegExp(`${blackFigure}`, 'g')) || []).length
        * blackFigureWeights[blackFigure];
    });

    Object.keys(whiteFigureWeights).forEach((whiteFigure) => {
      whiteForce += (fen_figures.match(new RegExp(`${whiteFigure}`, 'g')) || []).length
        * whiteFigureWeights[whiteFigure];
    });

    this.promotionActive.emit(false);
    this.forceChange.emit({whiteForce, blackForce});
    this.captured.emit(this.chessEngine.history( { verbose: true }).filter(move => move.captured));
  }

  updateReviewPosition(position?: IGameMove) {
    this.chessEngineReview.load(position.fen);
    if (this.chessground) {
      this.updateChessgroundReview();
    }
  }
}
