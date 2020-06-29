import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  isDevMode,
  ViewChildren, QueryList,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store, select, createSelector } from '@ngrx/store';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, first, map, take, tap, throttleTime } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { environmentMenu } from '../../../environments/environment.menu';
import * as fromRoot from '../../reducers/index';
import { DomHelper } from '../../shared/helpers/dom.helper';
import { SubscriptionHelper, Subscriptions} from '../../shared/helpers/subscription.helper';
import { ScreenSlideState, ScreenStateService } from '../../shared/screen/screen-state.service';
import { selectAuth, selectIsAuthorized, selectRefreshLoading, selectToken } from '../../auth/auth.reducer';
import { IPaygatePopupState, PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';

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

  private isMobile = false;

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  menu = environmentMenu['mainMenu'];

  token$ = this.store$.pipe(
    select(selectToken),
    map(t => t ? '?t=' + t : ''),
    first(),
  );

  window = window;

  @ViewChildren('mustBeFixed', {read: ElementRef}) mustBeFixed: QueryList<ElementRef>;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private store$: Store<fromRoot.State>,
    private elementRef: ElementRef<HTMLElement>,
    private cd: ChangeDetectorRef,
    private screenState: ScreenStateService,
    private paygatePopupService: PaygatePopupService,
    public paygatePopupManagerService: PaygatePopupManagerService
  ) {
  }

  currentStep$ = this.paygatePopupService.state$.pipe(
    map((state: IPaygatePopupState) => {
      return state.currentStep;
    }));

  ngOnInit() {
    this.subs.onMatchMobile = this.screenState.matchMediaMobile$
      .subscribe(matches => this.onMatchMediaMobile(matches));

    this.subs.isMainPage = this.router.events.subscribe((event) => {
      this.isMainPage = this.router.url === '/';
      this.cd.markForCheck();
    });

    this.subs.slideLeftBack = this.screenState.slideState$.subscribe((state: ScreenSlideState) => {
      if (this.isOpenSubNav && state === ScreenSlideState.Normal) {
        this.isOpenSubNav = false;
      }
    });

    this.subs.isMobile = this.screenState.matchMediaMobile$.subscribe((isMobile) => {
      this.isMobile = isMobile;
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

    this.mustBeFixed.forEach(el => this.screenState.addFixedElement(el.nativeElement));

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
        .subscribe((isFixed) =>
          this.ngZone.run(() => {
            this.isFixed = this.isOpenSubNav ? this.isMobile : isFixed;
            this.cd.markForCheck();
          })
        );
    });
  }

  openMobileSubNav() {
    if (!this.isOpenSubNav) {
      this.isOpenSubNav = true;
      this.screenState.slideLeft().subscribe(() => {
        if (this.isMobile) {
          this.isFixed = true;
        }
        this.cd.markForCheck();
      });
    }
  }

  closeMobileSubNav(gtagParams?: any[]) {
    if (this.isOpenSubNav) {
      this.screenState.slideLeftBack()
        .subscribe(() => {
          this.isOpenSubNav = false;
          this.isFixed = this.getOffsetTop() <= 0;
          this.cd.markForCheck();
        });
    }
    window['dataLayerPush'](...gtagParams);
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
    this.mustBeFixed.forEach(el => this.screenState.removeFixedElement(el.nativeElement));
  }

  get isDevMode(): boolean {
    return isDevMode();
  }
}
