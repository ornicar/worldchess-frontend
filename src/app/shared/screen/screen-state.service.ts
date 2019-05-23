import { Injectable, NgZone, OnDestroy } from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import { DomHelper } from '@app/shared/helpers/dom.helper';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import { BehaviorSubject, fromEvent, fromEventPattern, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, startWith, take, throttleTime } from 'rxjs/operators';
import {LockScroll} from '../helpers/lock-scroll';

const LOCK_MOBILE_SCREEN_CLASS = 'lock-mobile-screen';

export enum ScreenSlideState {
  Normal = 'normal',
  Left = 'left',
  Right = 'right'
}

enum ScreenWidth {
  MobileSmall = 576,
  Mobile = 768,
  TabletSmall = 950,
  TabletIPad = 1024,
  Tablet = 1280,
  TabletFull = 1366,
}

@Injectable()
export class ScreenStateService implements OnDestroy {
  private lockModel?: LockScroll;
  private lockCounter = 0;

  public fixedElements = new Set<HTMLElement>();

  public slideState$ = new BehaviorSubject<ScreenSlideState>(ScreenSlideState.Normal);

  private slideAnimationDoneSubject = new Subject<AnimationEvent>();

  private matchMediaMobile = window.matchMedia(`(max-width: ${ScreenWidth.Mobile}px)`);
  private matchMediaTabletSmall = window.matchMedia(`(max-width: ${ScreenWidth.TabletSmall}px)`);
  private matchMediaTabletIPad = window.matchMedia(`(max-width: ${ScreenWidth.TabletIPad}px)`);
  private matchMediaMobileSmall = window.matchMedia(`(max-width: ${ScreenWidth.MobileSmall}px)`);
  private matchMediaTablet = window.matchMedia(`(max-width: ${ScreenWidth.Tablet}px)`);
  private matchMediaTabletFull = window.matchMedia(`(max-width: ${ScreenWidth.TabletFull}px)`);

  public matchMediaMobile$: Observable<MediaQueryList['matches']> = this.createMatchMediaObservable(this.matchMediaMobile)
    .pipe(
      startWith(this.matchMediaMobile),
      map(mql => mql.matches),
      shareReplay(1)
    );

  public matchMediaTabletSmall$: Observable<MediaQueryList['matches']> = this.createMatchMediaObservable(this.matchMediaTabletSmall)
    .pipe(
      startWith(this.matchMediaTabletSmall),
      map(mql => mql.matches),
      shareReplay(1)
    );

  public matchMediaTabletIPad$: Observable<MediaQueryList['matches']> = this.createMatchMediaObservable(this.matchMediaTabletIPad)
    .pipe(
      startWith(this.matchMediaTabletIPad),
      map(mql => mql.matches),
      shareReplay(1)
    );

  public matchMediaTablet$: Observable<MediaQueryList['matches']> = this.createMatchMediaObservable(this.matchMediaTablet)
    .pipe(
      startWith(this.matchMediaTablet),
      map(mql => mql.matches),
      shareReplay(1)
    );

  public matchMediaTabletFull$: Observable<MediaQueryList['matches']> = this.createMatchMediaObservable(this.matchMediaTabletFull)
    .pipe(
      startWith(this.matchMediaTabletFull),
      map(mql => mql.matches),
      shareReplay(1)
    );

  public matchMediaMobileSmall$: Observable<MediaQueryList['matches']> = this.createMatchMediaObservable(this.matchMediaMobileSmall)
    .pipe(
      startWith(this.matchMediaMobileSmall),
      map(mql => mql.matches),
      shareReplay(1)
    );

  private viewportSizeSubject = new ReplaySubject<{width: number; height: number}>(1);

  public viewportSize$ = this.viewportSizeSubject
    .asObservable()
    .pipe(
      distinctUntilChanged(({ width, height }, { width: pWidth, height: pHeight }) => {
        return width === pWidth && height === pHeight;
      }),
      shareReplay(1)
    );

  get scrollTop() {
    return this.lockModel ? this.lockModel.scrollTop || 0 : 0;
  }

  private subs: Subscriptions = {};

  constructor(
    private ngZone: NgZone
  ) {}

  private createMatchMediaObservable(mql: MediaQueryList): Observable<MediaQueryList> {
    return fromEventPattern<MediaQueryList>(
      (handler: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => mql.addListener(handler),
      (handler: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => mql.removeListener(handler)
    );
  }

  initialize(rootElement: any) {
    if (this.lockModel) {
      this.lockModel.unlock();
    }

    this.lockModel = new LockScroll(rootElement);
    this.updateLockState();

    this.initViewportSize();
  }

  private updateViewportSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.viewportSizeSubject.next({ width, height });
  }

  private initViewportSize() {

    this.ngZone.runOutsideAngular(() => {
      this.subs.onResize = fromEvent(
        window,
        'resize',
        DomHelper.isPassiveSupported() ? { passive: true } : undefined
      )
        .pipe(
          throttleTime(20, undefined, { leading: true, trailing: true }),
        )
        .subscribe(() => {
          this.ngZone.run(() => this.updateViewportSize());
        });
    });

    this.updateViewportSize();
  }

  addFixedElement(element: HTMLElement) {
    this.fixedElements.add(element);
  }

  removeFixedElement(element: HTMLElement) {
    this.fixedElements.delete(element);
  }

  slideLeft(): Observable<AnimationEvent> {
    if (this.slideState$.value === ScreenSlideState.Normal) {
      this.lock();
      this.slideState$.next(ScreenSlideState.Left);

      return this.slideAnimationDoneSubject
        .pipe(
          filter(e => e.toState === ScreenSlideState.Left),
          take(1)
        );
    }

    return of(null);
  }

  slideLeftBack() {
    if (this.slideState$.value === ScreenSlideState.Left) {
      this.unlock();
      this.slideState$.next(ScreenSlideState.Normal);

      return this.slideAnimationDoneSubject
        .pipe(
          filter(e => e.toState === ScreenSlideState.Normal),
          take(1)
        );
    }

    return of(null);
  }

  onSlideAnimationDone(event: AnimationEvent) {
    this.slideAnimationDoneSubject.next(event);
  }

  lock() {
    this.lockCounter++;

    if (this.lockModel) {
      this.updateLockState();
    }
  }

  unlock() {
    this.lockCounter--;

    if (this.lockModel) {
      this.updateLockState();
    }
  }

  private updateLockState() {
    if (this.lockCounter > 0) {
      this.lockModel.lock();

      if (!document.body.classList.contains(LOCK_MOBILE_SCREEN_CLASS)) {
        document.body.classList.add(LOCK_MOBILE_SCREEN_CLASS);
      }
    } else {
      this.lockModel.unlock();
      this.lockCounter = 0;

      document.body.classList.remove(LOCK_MOBILE_SCREEN_CLASS);
    }
  }

  // When service will not use.
  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
