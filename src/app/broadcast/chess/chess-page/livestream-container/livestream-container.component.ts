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
import { OnChangesInputObservable, OnChangesObservable } from '../../../../shared/decorators/observable-input';
import { ScreenStateService } from '../../../../shared/screen/screen-state.service';
import * as fromRoot from '@app/reducers';
import * as fromCamera from '@app/broadcast/core/camera/camera.reducer';
import { ICamera } from '../../../core/camera/camera.model';
import { SubscriptionHelper, Subscriptions } from '../../../../shared/helpers/subscription.helper';

import { BehaviorSubject, merge } from 'rxjs';
import { GetCameras } from '../../../core/camera/camera.actions';
import { Tournament } from '@app/broadcast/core/tournament/tournament.model';
import { selectIsAuthorized } from '../../../../auth/auth.reducer';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import { selectUserPurchase } from '@app/purchases/user-purchases/user-purchases.reducer';
import { environment } from '../../../../../environments/environment';


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

  @OnChangesInputObservable()
  tourId$ = new BehaviorSubject<number>(this.tourId);

  cameras: ICamera[] = [];
  selectedCamera: ICamera = null;
  hover = false;

  cameras$ = this.store$.pipe(
    select(fromCamera.selectAll)
  );

  purchases$ = this.store$.pipe(
    select(selectUserPurchase)
  );

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

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
    this.subs.tour = merge(this.tourId$, this.purchases$).subscribe(() => {
      const tourId = this.tourId$.getValue();
      if (tourId) {
        this.store$.dispatch(new GetCameras({ tourId }));
      }
    });

    this.subs.cameras = this.cameras$.subscribe(
      cameras => {
        this.cameras = cameras;
        const availableCameras = this.cameras.filter(c => Boolean(c.link_display));
        this.selectedCamera = availableCameras.length
          ? availableCameras.find(cam => cam.is_default) || availableCameras[0]
          : null;

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
    this.selectedCamera = camera;
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
    if (!this.tournament || !this.tournament.product) {
      return;
    }
    if (this.tournament.slug === environment.tournamentLondonSlug) {
      this.paygatePopupManagerService.openPaygatePopupWithPlanPayment('pro');
    } else {
      this.paygatePopupManagerService.openPaygatePopupWithPurchase(this.tournament.product);
    }
  }
}
