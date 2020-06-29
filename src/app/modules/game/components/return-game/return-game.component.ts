import * as fromRoot from '@app/reducers';
import * as moment from 'moment';

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import {
  EUpdateMeStatus,
  IOnlineTournamentStandings,
  IUpdateMeResponse,
} from '@app/modules/game/tournaments/models/tournament.model';
import { Store as NGRXStore, select } from '@ngrx/store';
import { Observable, combineLatest, interval } from 'rxjs';
import {
  filter,
  first,
  map,
  share,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { GameTranslateService } from './../../service/game-translate.service';
import { IAccount } from '@app/account/account-store/account.model';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { TournamentGameState } from '../../tournaments/states/tournament.game.state';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { untilDestroyed } from '@app/@core';

@Component({
  selector: 'wc-return-game',
  templateUrl: './return-game.component.html',
  styleUrls: ['./return-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ReturnGameComponent implements OnInit, OnDestroy {
  @Select(TournamentGameState.hasNoTour) hasNoTour$: Observable<boolean>;
  @Select(TournamentGameState.getCurrentTourId) getCurrentTourId$: Observable<number>;
  @Select(TournamentState.getStandings) getStandings$: Observable<IOnlineTournamentStandings[]>;

  public readonly account$: Observable<IAccount> = this.store$.pipe(select(selectMyAccount), shareReplay(1));

  public readonly countdownTimer$: Observable<number> = this.getCurrentTourId$.pipe(
    switchMap((id) => {
      return this.tourService.getWithDefaults(id)
        .pipe(map((m) => moment(m.tour.datetime_of_round).diff(moment(), 'seconds')));
    }),
  );

  public readonly changeText$: Observable<string> = this.countdownTimer$.pipe(
    switchMap((data) => {
      if (data > 0) {
        return this.gameTranslateService.getTranslate('OTHER.UNTIL_GAME_START');
      } else {
        return this.gameTranslateService.getTranslate('BUTTONS.GO_TO_GAME');
      }
    }),
  );

  public readonly player$ = this.account$.pipe(
    filter((account) => !!account),
    map((account) => account.player),
    filter((player) => !!player),
  );

  public readonly updateMe$ = interval(4000)
    .pipe(
      startWith(0),
      switchMap(() => this.player$),
      filter((player) => !!player),
      switchMap(() => this.onlineTournamentResource.updateMe()),
      share(),
    );

  public readonly isShowReturnGame$: Observable<boolean> = this.updateMe$
    .pipe(
      withLatestFrom(this.hasNoTour$),
      map(this.checkOnShow()),
    );

  constructor(
    private tourService: TourResourceService,
    private store$: NGRXStore<fromRoot.State>,
    private router: Router,
    private modalService: ModalWindowsService,
    private onlineTournamentResource: OnlineTournamentResourceService,
    private gameTranslateService: GameTranslateService,
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  public goToBoard(): void {
    combineLatest([this.updateMe$, this.hasNoTour$])
      .pipe(
        first(),
        untilDestroyed(this)
      )
      .subscribe(([updateMe, hasNoTour]) => {
        if (
          updateMe.status === EUpdateMeStatus.GAME_IN_PROGRESS ||
          (updateMe.status === EUpdateMeStatus.WAITING_FOR_NEXT_TOUR && updateMe.board_uid)
        ) {
          this.modalService.closeAll();
          this.router.navigate([`/tournament/pairing/${updateMe.board_uid}/`]).then(() => {});
        } else {
          if (hasNoTour || updateMe.is_first_tour) {
            this.subToGameTranslateService('TEXT.OOPS_HAVE_OPPONENT');
          } else {
            this.subToGameTranslateService('TEXT.OOPS_YOU_LOST');
          }
        }
      });
  }

  private subToGameTranslateService(textConst: string): void {
    this.gameTranslateService
      .getTranslate(textConst)
      .pipe(
        first(),
        untilDestroyed(this)
      )
      .subscribe((msg) => {
        this.modalService.alert('', msg);
      });
  }

  private checkOnShow(): (value: [IUpdateMeResponse, boolean], index: number) => boolean {
    return ([updateMe, hasNoTour]) => {
      let isShow = false;
      if (updateMe.is_first_tour) {
        isShow = true;
      }
      if (!updateMe.is_first_tour) {
        switch (updateMe.status) {
          case EUpdateMeStatus.WAITING_FOR_NEXT_TOUR:
            {
              if (updateMe.board_uid) {
                isShow = true;
              } else {
                isShow = false;
              }
            }
            break;
          case EUpdateMeStatus.GAME_IN_PROGRESS:
            {
              isShow = true;
            }
            break;
          case EUpdateMeStatus.GAMEOVER:
            {
              isShow = false;
            }
            break;
          case EUpdateMeStatus.TOURNAMENT_OVER:
            {
              isShow = false;
            }
            break;
        }
        if (!!updateMe.tournament_id) {
          if (hasNoTour && updateMe.status !== EUpdateMeStatus.WAITING_FOR_NEXT_TOUR) {
            isShow = true;
          }
          if (!updateMe.is_last_tour && updateMe.status === EUpdateMeStatus.GAMEOVER) {
            isShow = true;
          }
        }
      }
      return isShow;
    };
  }
}
