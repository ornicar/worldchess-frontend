import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Router, NavigationEnd } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, map, throttleTime, filter } from 'rxjs/operators';
import * as fromRoot from '../../../reducers';
import { selectIsAuthorized } from '../../../auth/auth.reducer';
import { DomHelper } from '../../../shared/helpers/dom.helper';
import { Subscriptions, SubscriptionHelper } from '../../../shared/helpers/subscription.helper';


@Component({
  selector: 'wc-paygate-fixed-handler',
  templateUrl: './paygate-fixed-handler.component.html',
  styleUrls: ['./paygate-fixed-handler.component.scss'],
})
export class PaygateFixedHandlerComponent implements AfterViewInit, OnDestroy {

  @Input() fixed = true;

  @Input() background = '#9bcfff';

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  subs: Subscriptions = {};

  isFixed = true;

  public url$: Observable<string> = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.url)
  );

  public isArena$: Observable<boolean> = this.url$.pipe(
    map(url => url === '/arena')
  );

  public isArena: boolean;

  constructor(
    private store$: Store<fromRoot.State>,
    private elementRef: ElementRef<HTMLElement>,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
  ) {
    this.isArena$.subscribe(isArena => this.isArena = isArena);
   }

  openPaygatePopup() {
    this.router.navigate(['', { outlets: { p: ['paygate', 'register'] }}]);
  }

  private getOffsetBottom() {
    return this.elementRef.nativeElement ? this.elementRef.nativeElement.getBoundingClientRect().bottom : 0;
  }

  ngAfterViewInit() {
    if (!this.fixed) {
      return;
    }

    // this.isFixed = false;
    // this.cd.detectChanges();
    //
    // this.ngZone.runOutsideAngular(() => {
    //   this.subs.scroll = fromEvent(
    //     window,
    //     'scroll',
    //     DomHelper.isPassiveSupported() ? { passive: true } : undefined
    //   )
    //     .pipe(
    //       throttleTime(20, undefined, { leading: true, trailing: true }),
    //       map(() => this.getOffsetBottom() <= document.documentElement.clientHeight),
    //       distinctUntilChanged()
    //     )
    //     .subscribe(isFixed =>
    //       this.ngZone.run(() => {
    //         this.isFixed = isFixed;
    //         this.cd.markForCheck();
    //       })
    //     );
    // });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
