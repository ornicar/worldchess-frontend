import { IPlayerRatingItem, RatingTypeGame } from '../../app-common/services/player-rating.model';
import { createSelector, select, Store } from '@ngrx/store';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { distinctUntilChanged, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as fromRoot from '../../../reducers';
import { combineLatest, Subject, Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PlayerRatingResourceService } from '../../app-common/services/player-rating-resource.service';
import { IPlayerRating, IPlayerRatingGroup, IPlayerRatingFooterData } from '../../app-common/services/player-rating.model';
import { PLAYER_LABEL_COLOR } from '../player-labels/player-labels.component';
import { IAccount } from '../../../account/account-store/account.model';
import * as fromAccount from '../../../account/account-store/account.reducer';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { selectRefreshLoading, selectToken } from '@app/auth/auth.reducer';

@Component({
  selector: 'app-rating-player-page',
  templateUrl: './rating-player-page.component.html',
  styleUrls: ['./rating-player-page.component.scss'],
})
export class RatingPlayerPageComponent implements OnInit, OnDestroy {
  public player: IPlayerRatingGroup;
  public playerLight = '#000';
  public playerBorder = '#f6f6f6';
  public showMainNav = true;
  private destroy$ = new Subject();
  public userID = null;
  public isFriend = true;
  private _token = null;

  hideRank = false;
  isEvents = false;
  isRate = false;
  ownPlayer = false;

  myAccount$: Observable<IAccount> = this.store$.pipe(
    select(fromAccount.selectMyAccount)
  );

  classicPie = null;
  classicPieFideOnline = null;
  classicPieWorldChess = null;
  player_id: number;

  ratingChartData = null;
  ratingChartDataFide = {
    fide_rapid: null,
    fide_blitz: null,
    fide_bullet: null
  };
  ratingChartDataWS = {
    worldchess_bullet: null,
    worldchess_blitz: null,
    worldchess_rapid: null
  };

  token$ = this.store$.pipe(
    select(createSelector(
      selectToken,
      selectRefreshLoading,
      (token, refreshing) => ({ token, refreshing })
    )),
    filter(({token, refreshing}) => !refreshing),
    map(({token}) => token),
    first(),
    map(t => t ? t : null)
  );

  @ViewChild('chartSvg', { read: ElementRef, static: false }) chart: ElementRef;

  constructor(
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private ratingResource: PlayerRatingResourceService,
    private accountService: AccountResourceService,
    private store$: Store<fromRoot.State>,
  ) {
    this.token$.subscribe(token => {
      this._token = token;
    });
  }

  ngOnInit() {

    this.player_id = this.activatedRoute.snapshot.params.id;

    this.activatedRoute.params
        .pipe(
          map(params => parseInt(params.id, 10)),
          distinctUntilChanged(),
          switchMap(id => {
            return combineLatest(
              this.ratingResource.get(id),
              this.ratingResource.getPlayerStats(id),
              this.ratingResource.getIdFIDE(id, this._token),
              this.ratingResource.getIdWorldChess(id, this._token),
              this.ratingResource.getPlayerStatsType(id, 'fide'),
              this.ratingResource.getPlayerStatsType(id, 'worldchess'),
              this.myAccount$,
            );
          }),
          takeUntil(this.destroy$),
        )
        .subscribe(([
          player,
          playerStats,
          fidePlayer,
          worldPlayer,
          fideStats,
          worldchessStats,
          account,
        ]) => {
          this.player = {
            fide: player,
            fide_online: fidePlayer,
            worldchess: worldPlayer
          };

          if (fidePlayer || worldPlayer ) {
            //TODO: Оптимизировать присвоение
            if (Object.keys(worldPlayer).length) {
              this.userID = worldPlayer.profile.user_id;
              this.isFriend = worldPlayer.profile.is_friend;
            }
            if (Object.keys(fidePlayer).length) {
              this.userID = fidePlayer.profile.user_id;
              this.isFriend = worldPlayer.profile.is_friend;
            }
          }

          if (this.player.fide.labels) {
            if (this.player.fide.labels.length && PLAYER_LABEL_COLOR[this.player.fide.labels[0]]) {
              this.playerLight = this.playerBorder = PLAYER_LABEL_COLOR[this.player.fide.labels[0]];
            }
          }

          if ( Object.keys(playerStats).length ) {
            this.ratingChartData = playerStats.ratings;
            this.classicPie = playerStats.game_stats;
          }

          if ( Object.keys(fideStats).length ) {
            if ( fideStats.ratings !== null ) {
              this.classicPieFideOnline = fideStats.game_stats;
              this.ratingChartDataFide.fide_bullet = fideStats.ratings['bullet'];
              this.ratingChartDataFide.fide_blitz = fideStats.ratings['blitz'];
              this.ratingChartDataFide.fide_rapid = fideStats.ratings['rapid'];
            }
          }

          if ( Object.keys(worldchessStats).length ) {
            if ( worldchessStats.ratings !== null ) {
              this.classicPieWorldChess = worldchessStats.game_stats;
              this.ratingChartDataWS.worldchess_bullet = worldchessStats.ratings['bullet'];
              this.ratingChartDataWS.worldchess_blitz = worldchessStats.ratings['blitz'];
              this.ratingChartDataWS.worldchess_rapid = worldchessStats.ratings['rapid'];
            }
          }

          // authorization user
          if (account) {
            if (this.player.fide && (this.player.fide.fide_id === account.fide_id) ) {
              this.isEvents = true;
              this.ownPlayer = true;

            }

            if ( this.player.worldchess.profile && (this.player.worldchess.profile.user_id === account.id) ){
              this.isEvents = true;
              this.ownPlayer = true;
            }

            if ( this.player.fide_online.profile && (this.player.fide_online.profile.user_id === account.id) ){
              this.isEvents = true;
              this.ownPlayer = true;
            }

            if (account && !account.subscriptions) {
              this.isRate = true;
              this.ownPlayer = true;
            }
          }
          if ( Object.keys(fidePlayer).length || Object.keys(worldPlayer).length ) {
              let fide_id = null;

              if (Object.keys(fidePlayer).length) {
                fide_id = fidePlayer.profile.fide_id;
                this.hideRank = true;
              } else if (Object.keys(worldPlayer).length) {
                fide_id = worldPlayer.profile.fide_id;
                this.hideRank = true;
              }

              if (fide_id !== undefined && fide_id !== null) {
                combineLatest(
                  this.ratingResource.get(fide_id),
                  this.ratingResource.getPlayerStats(fide_id)
                ).subscribe( ([_player, _playerStats]) => {
                      if ( Object.keys(_player).length ) {
                        this.player.fide = _player;
                        this.classicPie = _playerStats.game_stats;
                        this.ratingChartData = _playerStats.ratings;
                      };
                  });
              }
            }
        });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  getRank(): number | null {
    return this.player.fide.rank || null;
  }

  getFullName(): string | null {
    if (this.player.fide.full_name) {
      return this.player.fide.full_name;
    }
    if (this.player.fide_online.profile) {
      return this.player.fide_online.profile.full_name;
    }
    if (this.player.worldchess.profile) {
      return this.player.worldchess.profile.full_name;
    }
    return null;
  }

  getAvatar(): string | null {
    if (this.player.fide_online.profile) {
      return this.player.fide_online.profile.avatar['full'];
    }
    if (this.player.worldchess.profile) {
      return this.player.worldchess.profile.avatar['full'];
    }
    if (this.player.fide.portrait) {
      return this.player.fide.portrait;
    }
    return null;
  }

  getLabels(): Array<String> {
    return this.player.fide.labels || [];
  }

  getPlayerFooterData(): IPlayerRatingFooterData {

    let federation: number | null = 0;
    let birth_date: number | string = '';

    if ( Object.keys(this.player.fide).length ) {
      federation = this.player.fide.federation;
      birth_date = this.player.fide.birth_year;
    } else {
      if (Object.keys(this.player.fide_online).length) {
        federation = this.player.fide_online.profile.country || 0;
        birth_date = this.player.fide_online.profile.birth_date;
      }
      if ( Object.keys(this.player.worldchess).length ) {
        federation = this.player.worldchess.profile.country || 0;
        birth_date = this.player.worldchess.profile.birth_date;
      }
    }
    return {
      rating: this.player.fide.rank || 0,
      title: this.player.fide.title || '',
      federation,
      birth_date
    };
  }

  getFide(): IPlayerRating | IPlayerRatingItem {
    if (Object.keys(this.player.fide).length) {
      return this.player.fide;
    }
    if (Object.keys(this.player.fide_online).length) {
      return this.player.fide_online;
    }
    if (Object.keys(this.player.worldchess).length) {
      return this.player.worldchess;
    }
    return null;
  }

  getFideOnline(): IPlayerRatingItem {
    return this.player.fide_online;
  }

  getWorldChess(): IPlayerRatingItem {
    return this.player.worldchess;
  }

  getWorldChessAverage(): string {
    const worldchess = this.player.worldchess;
    const average: number = (worldchess.worldchess_bullet + worldchess.worldchess_blitz + worldchess.worldchess_rapid) / 3;
    return average.toFixed(0);
  }
  /**
   * Checking the user for fide_id
   */
  IsFidePlayery(type: string = ''): boolean {
    if (this.player.fide.fide_id && type === '') {
        return true;
    }
    if (type !== '' && (this.player.fide_online.fide_bullet || this.player.worldchess.worldchess_bullet)) {
      return true;
    }
    return false;
  }

  addFriend() {
    this.isFriend = true;
    return this.accountService.addFriend(this.userID).subscribe();
  }

  deleteFriend() {
    this.isFriend = false;
    return this.accountService.deleteFriend(this.userID).subscribe();
  }
}
