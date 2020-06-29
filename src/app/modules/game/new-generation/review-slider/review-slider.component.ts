import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { SelectMove } from '@app/modules/game/state/game.actions';
import { GameState } from '@app/modules/game/state/game.state';
import { BehaviorSubject, interval, Observable, Subject } from 'rxjs';
import { IGameMove } from '@app/modules/game/state/game-move.model';
import { distinctUntilChanged, filter, map, take, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'game-review-slider',
  templateUrl: './review-slider.component.html',
  styleUrls: ['./review-slider.component.scss']
})
export class ReviewSliderComponent implements OnDestroy {

  destroy$ = new Subject();
  @ViewChild('container', { static: false, read: ElementRef }) container: ElementRef<HTMLElement>;
  @Select(GameState.selectedMove) selectedMove$: Observable<IGameMove>;
  @Select(GameState.moves) moves$: Observable<IGameMove[]>;
  moveIndex$ = this.selectedMove$.pipe(
    takeUntil(this.destroy$),
    filter(s => !!s),
    withLatestFrom(this.moves$),
    map(([selected, moves]) => moves.findIndex(m => m.fen === selected.fen)),
  );
  position$ = this.moveIndex$.pipe(
    withLatestFrom(this.moves$),
    map(([index, moves]) => {
      return Math.floor(index / ((moves.length - 1) / 100));
    }),
  );
  canNext$ = this.moveIndex$.pipe(
    withLatestFrom(this.moves$),
    map(([index, moves]) => index < (moves.length - 1)),
  );
  canPrev$ = this.moveIndex$.pipe(
    map((index) => index > 0),
  );

  private isDraggable$ = new BehaviorSubject(false);
  private mousex$ = new BehaviorSubject(0);
  cursor$ = this.mousex$.pipe(
    takeUntil(this.destroy$),
    throttleTime(20, undefined, { leading: true, trailing: true }),
    filter(x => !!this.container),
    map(x => {
      const minX = this.container.nativeElement.offsetLeft;
      const maxX = this.container.nativeElement.offsetLeft + this.container.nativeElement.offsetWidth;
      if (x < minX) {
        return minX;
      }
      if (x > maxX) {
        return maxX;
      }

      return x - minX;
    }),
    distinctUntilChanged(),
    map(x => {
      const perc = this.container.nativeElement.offsetWidth / 100;
      return Math.max(0, Math.min(Math.floor(x / perc), 100));
    }),
    distinctUntilChanged(),
  );

  constructor(
    private store$: Store,
  ) {
    this.cursor$.pipe(
      withLatestFrom(this.moves$),
      map(([cursor, moves]) => Math.floor(cursor * (moves.length / 100))),
      distinctUntilChanged(),
      withLatestFrom(this.moves$),
      map(([index, moves]) => moves[index]),
      filter(m => !!m),
    ).subscribe((move) => {
      this.store$.dispatch(new SelectMove(move));
    });
  }

  exit() {
    this.store$.dispatch(new SelectMove(null));
  }

  next() {
    this.canNext$.pipe(
      take(1),
      withLatestFrom(
        this.moveIndex$,
        this.moves$
      ),
    ).subscribe(([canNext, index, moves]) => {
      if (canNext) {
        this.store$.dispatch(new SelectMove(moves[index + 1]));
      }
    });
  }

  prev() {
    this.canPrev$.pipe(
      take(1),
      withLatestFrom(
        this.moveIndex$,
        this.moves$
      ),
    ).subscribe(([canPrev, index, moves]) => {
      if (canPrev) {
        this.store$.dispatch(new SelectMove(moves[index - 1]));
      }
    });
  }

  startDrag(event: MouseEvent) {
    this.isDraggable$.next(true);
  }

  @HostListener('document:mouseup')
  stopDrag() {
    this.isDraggable$.next(false);
  }

  @HostListener('document:mousemove', ['$event'])
  moveCursor(e: MouseEvent) {
    e.preventDefault();
    if (this.isDraggable$.value) {
      this.mousex$.next(e.clientX);
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.code === 'ArrowLeft') {
      this.prev();
    }

    if (event.code === 'ArrowRight') {
      this.next();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
