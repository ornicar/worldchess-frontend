import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { SetGameMenuVisible } from '@app/modules/game/state/game.actions';
import { Select, Store } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { Observable, Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';
import { INewMessage } from '@app/modules/game/state/game.model';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import { TournamentStatus } from '@app/broadcast/core/tournament/tournament.model';
@Component({
  selector: 'game-menu-logo',
  templateUrl: './game-menu-logo.component.html',
  styleUrls: ['./game-menu-logo.component.scss']
})
export class GameMenuLogoComponent implements OnInit, OnDestroy {

  @Input()
  isTournamentMenu = false;

  @Select(GameState.gameMenuVisible) gameMenuVisible$: Observable<boolean>;
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<INewMessage>;
  @Select(TournamentState.getTournament) tournament$: Observable<IOnlineTournament>;

  GameRatingMode = GameRatingMode;

  constructor(
    private store: Store
  ) {
    this.gameMenuVisible$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((menuVisible) => {
      this.openmenu = menuVisible;
    });
  }

  openmenu = false;
  destroy$ = new Subject();

  openMenu() {
    this.openmenu = true;
    this.store.dispatch(new SetGameMenuVisible(this.openmenu));
    this.tournament$.pipe(first()).subscribe((tournament) => {
      window['dataLayerPush'](
        'whcTournament',
        'Tournament',
        'Logo',
        'Tournaments icon',
        tournament.title,
        '',
        tournament.id,
        tournament.status === TournamentStatus.EXPECTED ? 'future' : tournament.status === TournamentStatus.GOES ? 'actual' : 'ended'
      );

    })
  }

  @HostListener('mouseenter')
  mouseenter() {
    this.openMenu();
  }

  @HostListener('touchend')
  touchstart() {
    this.openMenu();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
