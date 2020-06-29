import { PlayerRatingResourceService } from '@app/modules/app-common/services/player-rating-resource.service';
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, forkJoin, BehaviorSubject } from 'rxjs';
import { map, take, filter, switchMap, defaultIfEmpty, takeUntil } from 'rxjs/operators';
import { selectMyAccount, selectMyAccountRating } from '../../account-store/account.reducer';
import { IAccountRating, AccountVerification } from '@app/account/account-store/account.model';
import { PaygatePopupManagerService } from '@app/shared/services/paygate-popup-manager.service';
import * as fromRoot from '@app/reducers';
import { selectActivePlanSubscription, selectFideIdPlan, selectProPlan } from '@app/purchases/subscriptions/subscriptions.reducer';
import { environment } from '../../../../environments/environment';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';

const PREMIUM_PLAN = environment.premium_plan_stripe_id;

@Component({
  selector: 'app-profile-fide-id',
  templateUrl: 'profile-fide-id.component.html',
  styleUrls: [
    '../profile/profile.component.scss',
    'profile-fide-id.component.scss',
  ]
})
export class ProfileFideIdComponent implements OnInit {
  account$ = this.store$.pipe(select(selectMyAccount));

  rating$: Observable<IAccountRating> = this.store$.pipe(select(selectMyAccountRating));
  hasFideRating$: Observable<boolean> = this.rating$.pipe(
    map(rating => Boolean(rating.fide_rating))
  );

  fidePlan$: Observable<ISubscription> = this.store$.pipe(
    select(selectFideIdPlan),
  );

  activePlan$: Observable<ISubscription> = this.store$.pipe(
    select(selectActivePlanSubscription),
  );

  isFide$: Observable<boolean> = combineLatest(
    this.fidePlan$,
    this.activePlan$
  ).pipe(
    map(([fidePlan, activePlan]) => {
      return (fidePlan && fidePlan.is_active) || (activePlan && activePlan.plan.stripe_id === PREMIUM_PLAN);
    }),
  );

  needToSubmitFideForm$: Observable<boolean> = combineLatest(
    this.account$,
    this.fidePlan$,
    this.activePlan$,
  ).pipe(
    map(([ account, fidePlan, activePlan ]) => {
      if (account && ((fidePlan && fidePlan.is_active) || (activePlan && activePlan.plan.stripe_id === PREMIUM_PLAN))) {
        return account.is_finalized && account.fide_verified_status === null;
      } else {
        return false;
      }
    }),
  );

  AccountVerification = AccountVerification;

  public showMoreRating = false;

  public friendsList$  = new BehaviorSubject([]);

  sourceWS$ = this.account$.pipe(
    filter(account => !!account),
    take(1),
    switchMap((account) => {
      return this.ratingResource.getPlayerStatsType(account['player'].player_id, 'worldchess')
        .pipe(
          filter(r => r.ratings !== null),
          map(r => {
            return {
              pie: r.game_stats,
              line: {
                worldchess_bullet: r['ratings'].bullet,
                worldchess_blitz: r['ratings'].blitz,
                worldchess_rapid: r['ratings'].rapid,
              }
            };
          }),
          defaultIfEmpty(null)
        );
    })
  );

  sourceFide$ = this.account$.pipe(
    filter(account => !!account),
    take(1),
    switchMap((account) => {
      return this.ratingResource.getPlayerStatsType(account['player'].player_id, 'fide').pipe(
        filter(r => r.ratings !== null),
        map(r => {
          return {
            pie: r.game_stats,
            line: {
              fide_bullet: r['ratings'].bullet,
              fide_blitz: r['ratings'].blitz,
              fide_rapid: r['ratings'].rapid
            }
          };
        }),
        defaultIfEmpty(null)
      );
    })
  );

  fidelityPoints$ = this.account$.pipe(
    map(i => i.fidelity_points),
  );

  classicPieWorldChess = null;
  classicPieFideOnline = null;
  lineWS = null;
  lineFIDE = null;

  constructor(
    private store$: Store<fromRoot.State>,
    private paygatePopupService: PaygatePopupService,
    private paygatePopupManagerService: PaygatePopupManagerService,
    private ratingResource: PlayerRatingResourceService,
    private accountService: AccountResourceService,
  ) {
    this.accountService.getFriends().subscribe(data => {
      this.friendsList$.next(data);
    });
  }
  onShowMoreRating() {
    this.showMoreRating = !this.showMoreRating;
  }

  upgrade() {
    if (false) { // временно убираем функционал
      this.paygatePopupService.setState({
        fideSelected: true
      });
      this.paygatePopupService.stepLoaded$.next('payment');
      this.paygatePopupManagerService.openPaygatePopup('payment', {});
    }
  }

  requestFideId() {
    this.paygatePopupService.setState({ fideSelected: true });
    this.paygatePopupManagerService.openPaygateWithFideIdForm();
  }

  deleteFriend(id: number) {
    //TODO: Сделать account.state через NGXS и перенести туда этот код.
    return this.accountService.deleteFriend(id)
      .pipe(
        take(1)
      )
      .subscribe( () => {
        this.accountService.getFriends().subscribe(data => {
          this.friendsList$.next(data);
        });
      });
  }

  ngOnInit() {
    forkJoin({
      ws: this.sourceWS$,
      fide: this.sourceFide$
    }).subscribe( (source) => {
      if (source['fide']) {
        this.classicPieFideOnline = source['fide'].pie;
        this.lineFIDE = source['fide'].line;
      }
      if (source['ws']) {
        this.classicPieWorldChess = source['ws'].pie;
        this.lineWS = source['ws'].line;
      }
    });
  }
}
