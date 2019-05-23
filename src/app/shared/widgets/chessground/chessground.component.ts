import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as Chess from 'chess.js';
import {Chessground} from 'chessground';
import {Api as ChessgroundApi} from 'chessground/api';
import {Config as ChessgroundConfig} from 'chessground/config';
import * as ChessgroundType from 'chessground/types';
import {BehaviorSubject, fromEvent, Subject} from 'rxjs';
import {distinctUntilChanged, pairwise, startWith, throttleTime} from 'rxjs/operators';
import {IMovePosition} from '../../../broadcast/move/move.model';
import {OnChangesInputObservable, OnChangesObservable} from '../../decorators/observable-input';
import {DomHelper} from '../../helpers/dom.helper';
import {SubscriptionHelper, Subscriptions} from '../../helpers/subscription.helper';

interface IChessEngineMove {
  color: 'w' | 'b';
  flags: string;
  from: ChessgroundType.Key;
  to: ChessgroundType.Key;
  promotion?: string;
  san: string;
  piece: string;
}

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

  @Input() orientation: ChessgroundType.Color = 'white';
  @OnChangesInputObservable() orientation$ = new BehaviorSubject<ChessgroundType.Color>(this.orientation);

  @Input() canCreateMove = false;

  @HostBinding('class.movable')
  @Input() canMove = false;
  @OnChangesInputObservable() canMove$ = new BehaviorSubject<boolean>(this.canMove);

  @ViewChild('board', { read: ElementRef }) boardElement: ElementRef<HTMLElement>;

  @Output() positionChange = new EventEmitter<IMovePosition>();
  @Output() triedToMove = new EventEmitter<void>();

  chessEngine: any;
  chessground: ChessgroundApi;

  promotionMoves: IChessEngineMove[] = [];

  subs: Subscriptions = {};

  private animationStartTime = 0;

  private chessgroundDefaultConfig: ChessgroundConfig = {
    coordinates: false,
    resizable: true,
    highlight: {
      lastMove: true
    },
    animation: {
      enabled: false,
      duration: 600
    },
  };

  private onElementResizeSubject = new Subject<{width: number, height: number}>();

  constructor(
    private ngZone: NgZone,
    private element: ElementRef<HTMLElement>,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chessEngine = new Chess();

    this.subs.position = this.position$
      .pipe(
        startWith(null),
        distinctUntilChanged((prev, next) => {
          const prevFen = prev && prev.fen,
            nextFen = next && next.fen;

          return prevFen === nextFen;
        }),
        pairwise(),
      )
      .subscribe(([prev, next]) => {
        let isNextPosition = false;

        if (prev && next) {
          const isNextBlackMove = prev.move_number === next.move_number && !next.is_white_move;
          const isNextLineMove = (prev.move_number + 1) === next.move_number && next.is_white_move;
          isNextPosition = isNextBlackMove || isNextLineMove;
        }

        this.updatePosition(next, isNextPosition);
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
          distinctUntilChanged((prev, next) => prev.width === next.width && prev.height === next.height),
          throttleTime(20, undefined, { leading: true, trailing: true }),
        )
        .subscribe(() => {
          if (this.chessground) {
            this.redrawChessground();
          }
        });
    });
  }

  @OnChangesObservable()
  ngOnChanges() {
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
      this.ngZone.runOutsideAngular(() =>
        this.onElementResizeSubject.next({
          width: this.element.nativeElement.clientWidth,
          height: this.element.nativeElement.clientHeight
        })
      );
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

  private initializeChessground(): void {
    const viewConfig: ChessgroundConfig = {
      ...this.chessgroundDefaultConfig,
      check: this.chessEngine.in_check(),
      orientation: this.orientation,
      fen: this.chessEngine.fen(),
      turnColor: this.getChessTurnColor(),
      lastMove: this.getChessLastMove(),
      viewOnly: false,
      movable: {
        free: false,
        color: this.canMove ? this.getChessTurnColor() : null,
        dests: this.getChessPossibleMoves(),
        showDests: true,
        events: {
          after: this.onAfterMove.bind(this),
        },
      },
    };

    this.ngZone.runOutsideAngular(() =>
      this.chessground = Chessground(this.boardElement.nativeElement, viewConfig)
    );

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
      ? { enabled: true }
      : this.chessgroundDefaultConfig.animation;

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
        movable: {
          color: this.canMove ? this.getChessTurnColor() : null,
          dests: this.getChessPossibleMoves()
        }
      });
    });

    this.checkElementSize();
  }

  private redrawChessground() {
    // Recalculate figure positions.
    setTimeout(() => {
      this.ngZone.runOutsideAngular(() => this.chessground.redrawAll());
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

    const newPos: IMovePosition = {
      fen: this.chessEngine.fen(), // Get new FEN notation.
      san,
      move_number: this.position ? this.position.move_number + (isWhite ? 1 : 0) : 1,
      is_white_move: isWhite
    };

    this.ngZone.run(() => this.positionChange.emit(newPos));
  }

  updatePosition(position?: IMovePosition, isNextPosition = false) {
    let isEnableAnimation = false;

    if (position) {
      // Not change chess engine if new position not changed.
      if (position.fen !== this.chessEngine.fen()) {
        // Enable animation for valid next move.
        isEnableAnimation = isNextPosition && this.chessEngine.move(position.san);

        // Set chess initial position from fen notation when move is invalid.
        if (!isEnableAnimation) {
          this.chessEngine.load(position.fen);
        }
      }
    } else {
      this.chessEngine.reset();
    }

    if (this.chessground) {
      this.updateChessground(isEnableAnimation);
    }

    if (this.promotionMoves.length) {
      this.promotionMoves = [];
      this.cd.markForCheck();
    }
  }
}
