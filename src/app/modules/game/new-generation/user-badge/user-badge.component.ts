import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild } from '@angular/core';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, mergeMap, pluck, take, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { TFigure } from '@app/shared/widgets/chessground/figure.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { IGameBadgeNotification } from '@app/modules/game/game-page/game-page.component';
import { OnChangesInputObservable } from '@app/shared/decorators/observable-input';
import { Select } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { INewMessage } from '@app/modules/game/state/game.model';
import { OnlineTournamentService } from '@app/modules/game/tournaments/services/tournament.service';

const threshold = 10; // порог сжатия блока взятых фигур

@Component({
  selector: 'game-user-badge',
  templateUrl: 'user-badge.component.html',
  styleUrls: ['user-badge.component.scss']
})
export class GameUserBadgeComponent implements OnChanges, OnDestroy, AfterViewChecked {
  @Input() player: IPlayer;
  @Input() playerName: string;
  @Input() timer: number;
  @Input() capturedFigureColor: ChessColors;
  @Input() capturedFigures: TFigure[];
  @Input() materialAdvantage: number;
  @Input() messageDisplayed: IGameBadgeNotification;
  @Input() isMyMove: boolean;
  @Input() isPromotionPopupVisible: boolean;
  @Input() gameReviewMode: boolean;
  @Input() timeLimitNotification: boolean;
  @Input() boardIsFlipped: boolean;
  @Input() isReplay?: boolean;
  @Input() isShowChat?: boolean;
  @Input() playerScore?: number;
  @Input() playerRank?: number;
  @Input() showPlayerTournamentScore = false;

  @ViewChild('badge', { read: ElementRef, static: false }) badge: ElementRef<HTMLElement>;
  @ViewChild('playerStat', { read: ElementRef, static: false }) playerStat: ElementRef<HTMLElement>;
  @ViewChild('takenFigures', { read: ElementRef, static: false }) takenFigures: ElementRef<HTMLElement>;


  durationFormat: moment.DurationFormatSettings = {
    trim: false,
    usePlural: false,
    useSignificantDigits: true
  };

  capturedFigureColor$: BehaviorSubject<ChessColors> = new BehaviorSubject(null);
  capturedFigures$: BehaviorSubject<TFigure[]> = new BehaviorSubject(null);
  materialAdvantage$: BehaviorSubject<number> = new BehaviorSubject(null);
  playerName$: BehaviorSubject<string> = new BehaviorSubject('');
  messageDisplayed$: BehaviorSubject<IGameBadgeNotification> = new BehaviorSubject({});
  isMyMove$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  needTakenFiguresSqueeze$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  playerInfoCollapsed$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  figuresRerendered$ = new Subject();
  gameReviewMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  timeLimitNotification$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  boardIsFlipped$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isReplay$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isShowChat$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  destroy$ = new Subject();

  playerInfoVisible = true;
  timerVisible = true;
  takenFiguresVisible = true;
  promotionPopupVisible = false;
  gameReviewModeMobile = false;


  duration$ = new BehaviorSubject<number>(moment.duration(0, 'seconds').asMilliseconds());

  countryName = '';
  isMobile = false;
  defaultAvatar = '../../../assets/images/avatar_rabbit.svg';

  constructor(
    private country: CountryResourceService,
    public tournamentService: OnlineTournamentService
  ) {
    this.capturedFigures$.pipe(
      mergeMap(() => {
        return this.figuresRerendered$.pipe(
          distinctUntilChanged(),
          take(1)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const playerStatChildCollection = this.playerStat && this.playerStat.nativeElement.children;
      if (playerStatChildCollection) {
        const playerStatWidth = Array.from(playerStatChildCollection).reduce((sum, child) => {
          return sum + child.clientWidth;
        }, 0);

        const takenFiguresWidth = this.takenFigures && this.takenFigures.nativeElement.clientWidth;

        if (playerStatWidth + takenFiguresWidth + threshold > this.badge.nativeElement.offsetWidth) {
          this.needTakenFiguresSqueeze$.next(true);
        }
      }
    });

    this.isMobile = window.innerWidth <= 999;
    this.gameReviewMode$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((gameReviewMode) => {
        this.gameReviewModeMobile = gameReviewMode && this.isMobile;
      }
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 999;
  }

  toggleFigures(figuresToggled: boolean) {
    this.playerInfoCollapsed$.next(!figuresToggled);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['timer']) {

      let duration = moment.duration(0, 'seconds').asMilliseconds();
      if (changes['timer'].currentValue > 0) {
        duration = moment.duration(changes['timer'].currentValue, 'seconds').asMilliseconds();
      }
      this.duration$.next(duration);
    }

    if (changes['isReplay']) {
      this.isReplay$.next(changes['isReplay'].currentValue);
    }
    if (changes['isShowChat']) {
      this.isShowChat$.next(changes['isShowChat'].currentValue);
    }

    if (changes['capturedFigureColor']) {
      this.capturedFigureColor$.next(changes['capturedFigureColor'].currentValue);
    }
    if (changes['capturedFigures']) {
      this.capturedFigures$.next(changes['capturedFigures'].currentValue);
    }
    if (changes['materialAdvantage']) {
      this.materialAdvantage$.next(changes['materialAdvantage'].currentValue);
    }
    if (changes['playerName']) {
      this.playerName$.next(changes['playerName'].currentValue);
    }
    if (changes['messageDisplayed']) {
      const message: IGameBadgeNotification = changes['messageDisplayed'].currentValue;
      this.messageDisplayed$.next(message);
      this.playerInfoVisible = true;
      this.timerVisible = true;
      this.takenFiguresVisible = true;

      if (message) {
        this.playerInfoVisible = false;
        this.timerVisible = false;
        this.takenFiguresVisible = false;
        if (message.notification === 'Accept a draw') {
          this.timerVisible = true;
        }
      }
    }

    if (changes['isMyMove']) {
      this.isMyMove$.next(changes['isMyMove'].currentValue);
    }

    if (changes['isPromotionPopupVisible']) {
      this.promotionPopupVisible = changes['isPromotionPopupVisible'].currentValue;
    }

    if (changes['player']) {
      const player = changes['player'].currentValue;
      if (player) {
        if (player.nationality_id) {
          this.country.get(player.nationality_id).pipe(
            filter(v => !!v),
            pluck('code'),
          ).subscribe((name) => {
            this.countryName = name;
          });
        }
      }
    }

    if (changes['gameReviewMode']) {
      this.gameReviewMode$.next(changes['gameReviewMode'].currentValue);
    }

    if (changes['timeLimitNotification']) {
      this.timeLimitNotification$.next(changes['timeLimitNotification'].currentValue);
    }
    if (changes['boardIsFlipped']) {
      this.boardIsFlipped$.next(changes['boardIsFlipped'].currentValue);
    }
  }

  ngAfterViewChecked(): void {
    this.figuresRerendered$.next(this.takenFigures
      && this.takenFigures.nativeElement
      && this.takenFigures.nativeElement.clientWidth);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
