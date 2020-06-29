import { TranslateService } from '@ngx-translate/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ArchiveGameResult, IOnlinePlayerGameArchive } from '@app/modules/game/state/game-history-response.model';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { Store } from '@ngxs/store';
import { DownloadPGN } from '@app/modules/game/state/game.actions';
import { ISubscription } from '@app/purchases/subscriptions/subscriptions.model';
import { select, Store as NgrxStore } from '@ngrx/store';
import { selectFideIdPlan } from '@app/purchases/subscriptions/subscriptions.reducer';
import * as fromRoot from '@app/reducers';
import { Router } from '@angular/router';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';

export interface IOnlinePlayerGameArchiveGroupedByMonth {
  month: string;
  year: string;
  results: IOnlinePlayerGameArchive[];
}

@Component({
  selector: 'wc-my-games',
  templateUrl: './my-games.component.html',
  styleUrls: ['./my-games.component.scss']
})
export class MyGamesComponent implements OnInit, OnDestroy {
  window = window;
  destroy$ = new Subject();

  gamesHistoryGrouped = new BehaviorSubject<IOnlinePlayerGameArchiveGroupedByMonth[]>([]);
  gamesList: IOnlinePlayerGameArchive[] = [];

  moment = moment;
  GameRatingMode = GameRatingMode;
  hasMoreGames = true;
  isLoading$ = new BehaviorSubject(false);

  durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  fidePurchased$: Observable<ISubscription> = this.store$.pipe(
    select(selectFideIdPlan),
    filter(p => p && p.is_active),
  );
  fidePurchased = false;
  _needFetch = new Subject();

  limit = 5;
  offset = 0;

  constructor(
    private gameResourceService: GameResourceService,
    private store: Store,
    private store$: NgrxStore<fromRoot.State>,
    private router: Router,
    private paygatePopupService: PaygatePopupService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit() {
    this.fidePurchased$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((fidePurchased) => {
      this.fidePurchased = !!fidePurchased;
      if (this.fidePurchased) {
        this.limit = 10;
      } else {
        this.limit = 5;
      }
      this.fetchHistory();
    });

    this._needFetch.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(() => this.fetchHistory());
  }

  public downloadPGN(url: string, pgnName: string): void {
    this.store.dispatch(new DownloadPGN(url, pgnName));
    window['dataLayerPush']('wchEvent', 'Profile', 'My Games', 'Download', '', '');
  }

  public convertResult(result: ArchiveGameResult): Observable<string> {
    let archiveType = 'WON';
    switch (result) {
      case ArchiveGameResult.Draw: {
        archiveType = 'DRAW';
      } break;
      case ArchiveGameResult.Lost: {
        archiveType  = 'LOST';
      } break;
      case ArchiveGameResult.Won: {
        archiveType  = 'WON';
      } break;
    }
    return this.translateService.get(`GAME.${archiveType}`);
  }

  onScroll() {
    this._needFetch.next();
  }

  fetchHistory() {
    if (this.hasMoreGames && this.fidePurchased || !this.offset) {
      this.isLoading$.next(true);
      this.gameResourceService.getGamesHistory(this.limit, this.offset).pipe(
        tap((response) => {
          this.hasMoreGames = !!response.next;
        }),
        map((response) => {
          return response.results;
        })
      ).subscribe((results) => {
        this.gamesList = this.gamesList.concat(results);
        const tempGroupedList: IOnlinePlayerGameArchiveGroupedByMonth[] = [];
        let temp: IOnlinePlayerGameArchiveGroupedByMonth = {
          month: null,
          year: null,
          results: []
        };
        const currentMonth = moment(moment.now()).format('MMMM');
        const currentYear = moment(moment.now()).format('YYYY');
        this.gamesList.forEach((game) => {
          const check = moment(game.created);

          const month = check.format('MMMM') === currentMonth ? null : check.format('MMMM');
          const year  = check.format('YYYY') === currentYear ? null : check.format('YYYY');
          if (temp.month === month && temp.year === year) {
            temp.results.push(game);
          } else {
            if (temp.results.length) {
              tempGroupedList.push(temp);
            }

            temp = {
              month,
              year,
              results: []
            };

            temp.results.push(game);
          }
        });
        if (temp.results.length) {
          tempGroupedList.push(temp);
        }

        this.isLoading$.next(false);
        this.gamesHistoryGrouped.next(tempGroupedList);
      });
      this.offset += this.limit;
    }
  }

  public updateAccount(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.paygatePopupService.setState({ fideSelected: true });
    this.paygatePopupService.stepLoaded$.next('payment');
    this.router.navigate(['', { outlets: { p: ['paygate', 'payment']} }]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
