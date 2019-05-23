import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import {combineLatest, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {SubscriptionHelper} from '../../../shared/helpers/subscription.helper';
import {PlayerRatingResourceService} from '../../../broadcast/core/playerRating/player-rating-resource.service';
import {IPlayerRating} from '../../../broadcast/core/playerRating/player-rating.model';
import {GetCountries} from '../../../broadcast/core/country/country.actions';
import {PLAYER_LABEL_COLOR} from '../player-labels/player-labels.component';

@Component({
  selector: 'app-rating-player-page',
  templateUrl: './rating-player-page.component.html',
  styleUrls: ['./rating-player-page.component.scss'],
})
export class RatingPlayerPageComponent implements OnInit, OnDestroy {
  public player: IPlayerRating;
  public playerLight = '#000';
  public playerBorder = '#f6f6f6';

  private subs: {[key: string]: Subscription} = {};

  classicPie = null;
  ratingChartData = null;

  @ViewChild('chartSvg', {read: ElementRef}) chart: ElementRef;

  constructor(
    private store$: Store<fromRoot.State>,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private ratingResource: PlayerRatingResourceService,
  ) {
    this.store$.dispatch(new GetCountries());

    this.subs.playerFideIdParam = this.activatedRoute.params
      .pipe(
        map(params => parseInt(params.id, 10)),
        distinctUntilChanged(),
        switchMap(id => {
          return combineLatest(
            this.ratingResource.get(id),
            this.ratingResource.getPlayerStats(id),
          );
        })
      )
      .subscribe(([player, playerStats]) => {
        this.player = player;
        if (this.player.labels.length && PLAYER_LABEL_COLOR[this.player.labels[0]]) {
          this.playerLight = this.playerBorder = PLAYER_LABEL_COLOR[this.player.labels[0]];
        }
        this.ratingChartData = playerStats.ratings;
        this.classicPie = playerStats.game_stats;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
