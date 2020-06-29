import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
  OnChanges,
  HostBinding
} from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import * as fromRoot from '@app/reducers';
import * as fromCamera from '@app/broadcast/core/camera/camera.reducer';
import { ICamera } from '../../../core/camera/camera.model';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { GetCameras, ClearCameras } from '../../../core/camera/camera.actions';
import { Tournament } from '@app/broadcast/core/tournament/tournament.model';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import { selectUserPurchase } from '@app/purchases/user-purchases/user-purchases.reducer';
import { environment } from '../../../../../environments/environment';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'wc-livestream-container',
  templateUrl: './livestream-container.component.html',
  styleUrls: ['./livestream-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LivestreamContainerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() main = false; // @todo remove it.

  @Input() tournament: Tournament;

  @Input() tourId: number;

  @Input() embedded = false;

  @OnChangesInputObservable()
  tourId$ = new BehaviorSubject<number>(this.tourId);

  selectedCamera$ = new BehaviorSubject<ICamera>(null);

  cameras$ = this.store$.pipe(
    select(fromCamera.selectAll)
  );

  purchases$ = this.store$.pipe(
    select(selectUserPurchase)
  );

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  isBenefitsBlockShown$: Observable<boolean> = combineLatest(
    this.isAuthorized$,
    this.cameras$,
    this.selectedCamera$,
  ).pipe(
    map(([isAuthorized, cameras, selectedCamera]) => {
      if (!this.embedded) {
        return isAuthorized && cameras && cameras.length
                  && (selectedCamera && !selectedCamera.link_display || !selectedCamera);
      } else {
        return !isAuthorized || cameras && cameras.length
                  && (selectedCamera && !selectedCamera.link_display || !selectedCamera);
      }
    }),
  );

  hover = false;
  subs: Subscriptions = {};

  @HostBinding('class.show-mobile')
  showLiveStreamScreen = false;

  constructor(
    private store$: Store<fromRoot.State>,
    private router: Router,
    private cd: ChangeDetectorRef,
    private screenService: ScreenStateService,
    private paygatePopupManagerService: PaygatePopupManagerService,
  ) {}

  ngOnInit() {
    if (!this.embedded) {
      this.subs.tour = combineLatest(this.isAuthorized$, this.tourId$, this.purchases$).subscribe(([isAuthorized, tourId, purchases]) => {
        if (!isAuthorized) {
          this.store$.dispatch(new ClearCameras());
        } else if (tourId) {
          this.store$.dispatch(new GetCameras({ tourId }));
        }
      });
    }
    this.subs.cameras = this.cameras$.subscribe(
      cameras => {
        const availableCameras = cameras.filter(c => Boolean(c.link_display));
        const selectedCamera = availableCameras.length
          ? availableCameras.find(cam => cam.is_default) || availableCameras[0]
          : null;
        this.selectedCamera$.next(selectedCamera);
        this.cd.markForCheck();
      }
    );
  }

  @OnChangesObservable()
  ngOnChanges() {}

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  selectCamera(camera: ICamera) {
    this.selectedCamera$.next(camera);
    this.cd.markForCheck();
  }

  openLiveStreamScreen() {
    this.showLiveStreamScreen = true;
    this.screenService.lock();
  }

  closeLiveStreamScreen() {
    this.showLiveStreamScreen = false;
    this.screenService.unlock();
  }

  toggleHover(state = false) {
    this.hover = state;
    this.cd.markForCheck();
  }

  @HostListener('mouseover')
  mouseover() {
    this.toggleHover(true);
  }

  @HostListener('mouseout')
  mouseout() {
    this.toggleHover(false);
  }

  openGoPremiumModal() {
    if (!this.tournament) {
      this.paygatePopupManagerService.openPaygatePopup('login');
    } else {
      this.isAuthorized$.pipe(take(1)).subscribe((isAuth) => {
        if (!isAuth) {
          this.paygatePopupManagerService.openPaygatePopup('login');
        } else {
          if (this.tournament.slug === environment.tournamentLondonSlug) {
            this.paygatePopupManagerService.openPaygatePopupWithPlanPayment('pro');
          } else if (!this.tournament.product) {
            this.paygatePopupManagerService.openPaygateWithUpgrade();
          } else {
            this.paygatePopupManagerService.openPaygatePopupWithPurchase(this.tournament.product);
          }
        }
      });
    }
  }
}
