import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, isDevMode} from '@angular/core';
import {Router} from '@angular/router';
import { Store, select } from '@ngrx/store';
import {fromEvent} from 'rxjs';
import {distinctUntilChanged, map, throttleTime} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {EventTextKeys} from '../../broadcast/core/event/event.model';
import * as fromRoot from '../../reducers/index';
import {DomHelper} from '../../shared/helpers/dom.helper';
import {SubscriptionHelper, Subscriptions} from '../../shared/helpers/subscription.helper';
import {ScreenStateService} from '../../shared/screen/screen-state.service';
import { selectIsAuthorized } from '../../auth/auth.reducer';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs: Subscriptions = {};

  isMainPage: boolean;

  tournamentLondonSlug = environment.tournamentLondonSlug;
  tournamentOlympiadId = environment.tournamentOlympiadId;

  public isFixed = false;

  public isOpenSubNav = false;

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private store$: Store<fromRoot.State>,
    private elementRef: ElementRef<HTMLElement>,
    private cd: ChangeDetectorRef,
    private screenState: ScreenStateService,
  ) {
  }

  ngOnInit() {
    this.subs.onMatchMobile = this.screenState.matchMediaMobile$
      .subscribe(matches => this.onMatchMediaMobile(matches));

    this.subs.isMainPage = this.router.events.subscribe((event) => {
      window.scrollTo(0, 0);
      this.isMainPage = this.router.url === '/';
      this.cd.markForCheck();
    });
  }

  private getOffsetTop() {
    return this.elementRef.nativeElement ? this.elementRef.nativeElement.getBoundingClientRect().top : 0;
  }

  private onMatchMediaMobile(matches: MediaQueryList['matches']) {

    // Hide menu when screen changes.
    if (this.isOpenSubNav) {
      // Slide back mobile menu.
      if (!matches) {
        this.screenState.slideLeftBack()
          .subscribe(() => this.isOpenSubNav = false);
      } else {
        this.isOpenSubNav = false;
      }
    }
  }

  ngAfterViewInit() {
    this.isFixed = false;
    this.cd.detectChanges();

    this.ngZone.runOutsideAngular(() => {
      this.subs.scroll = fromEvent(
        window,
        'scroll',
        DomHelper.isPassiveSupported() ? { passive: true } : undefined
      )
        .pipe(
          throttleTime(20, undefined, { leading: true, trailing: true }),
          map(() => this.getOffsetTop() <= 0),
          distinctUntilChanged()
        )
        .subscribe(isFixed =>
          this.ngZone.run(() => {
            this.isFixed = isFixed;
            this.cd.markForCheck();
          })
        );
    });
  }

  openMobileSubNav() {
    if (!this.isOpenSubNav) {
      this.isOpenSubNav = true;
      this.screenState.slideLeft();
    }
  }

  closeMobileSubNav() {
    if (this.isOpenSubNav) {
      this.screenState.slideLeftBack()
        .subscribe(() => this.isOpenSubNav = false);
    }
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  get isDevMode(): boolean {
    return isDevMode();
  }
}
