import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { IOnlineTournamentBoard } from '@app/modules/game/tournaments/models/tournament.model';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { OnlineTournamentService } from '@app/modules/game/tournaments/services/tournament.service';

@Component({
  selector: 'wc-online-tournament-pgn-widget',
  templateUrl: './online-tournament-pgn-widget.component.html',
  styleUrls: ['./online-tournament-pgn-widget.component.scss']
})
export class OnlineTournamentPgnWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  board: IOnlineTournamentBoard;

  @Output()
  wsmouseover = new EventEmitter<boolean>();

  @OnChangesInputObservable('board')
  boardInput$ = new BehaviorSubject<IOnlineTournamentBoard>(this.board);
  countries$ = this.paygatePopupService.countries$;
  board$: Observable<IOnlineTournamentBoard> = this.boardInput$.pipe(
    filter(board => Boolean(board)),
    shareReplay(1)
  );

  destroy$ = new Subject();

  blackPlayer: IPlayer;
  whitePlayer: IPlayer;
  blackCountry: string;
  whiteCountry: string;
  boardID: string | null;

  constructor(
    private paygatePopupService: PaygatePopupService,
    private onlineTournamentSerivce: OnlineTournamentService,
  ) { }

  ngOnInit() {
    combineLatest([
      this.board$,
      this.countries$,
    ]).pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe( ([{ board_id, black_player, white_player }, countries]) => {
      this.blackPlayer = black_player;
      this.whitePlayer = white_player;
      this.boardID = board_id;

      if ( black_player.nationality_id) {
        this.blackCountry = countries.find(c => c.id === black_player.nationality_id).long_code;
      }

      if (white_player.nationality_id) {
        this.whiteCountry = countries.find(c => c.id === white_player.nationality_id).long_code;
      }
    });
  }

  downloadPGN() {
    if (this.boardID) {
      this.onlineTournamentSerivce.downloadPGN(this.boardID);
    }
  }

  @OnChangesObservable()
  ngOnChanges(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.wsmouseover.emit(true);
  }
}
