import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GetBoardsByTour } from '@app/broadcast/core/board/board.actions';
import { IBoard } from '@app/broadcast/core/board/board.model';
import * as fromBoards from '@app/broadcast/core/board/board.reducer';
import { getPlayersIdsByBoard } from '@app/broadcast/core/board/board.reducer';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { selectPlayersByIds } from '@app/broadcast/core/player/player.reducer';
import { ITour } from '@app/broadcast/core/tour/tour.model';
import * as fromTour from '@app/broadcast/core/tour/tour.reducer';
import { createSelector, select, Store } from '@ngrx/store';
import { BehaviorSubject, interval, of, combineLatest } from 'rxjs';
import { delay, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { Tournament } from '../../../../broadcast/core/tournament/tournament.model';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '../../../../shared/helpers/subscription.helper';
import { ScreenStateService } from '../../../../shared/screen/screen-state.service';
import * as fromBoard from '../../../core/board/board.reducer';
import { GameCloseEmbeddedWidgetModal } from '../game/game.actions';

enum Style {
  Light = 'light',
  Dark = 'dark'
}

enum Size {
  Full = 'full',
  Narrow = 'narrow',
  Responsive = 'responsive'
}

export const selectToursByTournament = createSelector(
  fromTour.selectAll,
  (tours, {tournamentId}) => tours.filter(tour => tour.tournament === tournamentId)
);

export const selectBoardsByTour = createSelector(
  fromBoards.selectAll,
  (boards, { tourId }) => boards.filter(board => board.tour === tourId)
);

@Component({
  selector: 'wc-get-embedded-widget',
  templateUrl: './get-embedded-widget.component.html',
  styleUrls: ['./get-embedded-widget.component.scss']
})
export class GetEmbeddedWidgetComponent implements OnInit, OnChanges, OnDestroy {
  private subs: Subscriptions = {};

  @Input()
  tournament: Tournament;

  @OnChangesInputObservable()
  tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  @Input()
  tour: ITour;

  @OnChangesInputObservable()
  tour$ = new BehaviorSubject<ITour>(this.tour);

  @Input()
  boardId: number;

  tours$ = this.tournament$.pipe(
    switchMap(tournament => tournament
      ? this.store$.pipe(select(selectToursByTournament, {tournamentId: tournament.id}))
      : of([])
    ),
    map((tours: ITour[]) => {
      const orderedTours = [...tours];
      orderedTours.sort((a, b) => {
        return a.tour_number - b.tour_number ||
          new Date(a.datetime_of_round_finish).getTime() - new Date(b.datetime_of_round_finish).getTime();
      });
      return orderedTours;
    }),
  );

  allBoards$ = this.store$.pipe(
    select(fromBoards.selectAll),
  );

  boards$ = combineLatest([this.tour$, this.allBoards$]).pipe(
    switchMap(([tour, allBoards]) => {
      return tour && allBoards
        ?  this.store$.pipe(select(selectBoardsByTour, { tourId: tour.id }))
        : of([]);
    }),
    tap(boards => {
      if (boards && boards.length) {
        this.boardId = boards[0].id;
      }
    })
  );

  public wholeTournament = false;

  public Style = Style;
  public selectedStyle = Style.Dark;

  public Size = Size;
  public selectedSize = Size.Responsive;

  private selectPlayersByIds = selectPlayersByIds();
  private boardsPlayers: IPlayer[] = [];

  public showCopied$ = new BehaviorSubject(false);

  @ViewChild('iframeCodeEl', { static: true }) iframeCodeEl: ElementRef<any>;

  constructor(
    private store$: Store<fromBoard.State>,
    private screenService: ScreenStateService
  ) {
  }

  public ngOnInit() {
    this.screenService.lock();

    this.subs.getBoards = this.tour$
        .pipe(
        map(tour => tour && tour.id),
        filter(id => Boolean(id))
      )
      .subscribe(tourId =>
    this.store$.dispatch(new GetBoardsByTour({ id: tourId }))
      );

    this.subs.boardPlayers = this.boards$
      .pipe(
        switchMap(boards => this.store$.pipe(
          select(this.selectPlayersByIds, { playerIds: boards.reduce((ids, board) => ids.concat(getPlayersIdsByBoard(board)), []) }),
        ))
      ).subscribe(players => {
        this.boardsPlayers = players;
      });

    this.subs.showCopied = this.showCopied$.pipe(
      filter(show => !!show),
      delay(2000),
    ).subscribe(() => {
      this.showCopied$.next(false);
    });
  }

  @OnChangesObservable()
  public ngOnChanges(changes: SimpleChanges) {
    if (changes['wholeTournament']) {
      window['gtag']('event', 'wholeTournament', {
        event_category: 'embedding',
        value: changes['wholeTournament'].currentValue,
        event_label: this.tournament.title,
      });
    }
  }

  public changeTour(tour: ITour) {
    this.tour = tour;
    this.tour$.next(this.tour);

    this.boardId = null;

    this.store$.dispatch(new GetBoardsByTour({ id: tour.id }));
  }

  private getPlayer(id) {
    return this.boardsPlayers.find(p => p.fide_id === id);
  }

  public getPlayersName(board: IBoard): string {
    const white = board.white_player_name || (this.getPlayer(board.white_player) || {} as IPlayer).full_name;
    const black = board.black_player_name || (this.getPlayer(board.black_player) || {} as IPlayer).full_name;

    return `${white} - ${black}`;
  }

  public get iframeCode() {
    const sizeAttrs = size => {
      switch (size) {
        case Size.Full:
          return 'width="980" height="700"';

        case Size.Narrow:
          return 'width="580" height="885"';

        case Size.Responsive:
          return 'width="100%" height="700"';

        default:
          return '';
      }
    };

    const baseUrl = `${environment.applicationUrl}/embedded-widget/tournament/${this.tournament.id}`;
    const gameUrl = !this.wholeTournament && this.boardId ? `/pairing/${this.boardId}` : '';
    const widgetOptions = `?style=${encodeURIComponent(this.selectedStyle)}`;

    return `<iframe src="${baseUrl + gameUrl + widgetOptions}" ${sizeAttrs(this.selectedSize)} style="border: 0"></iframe>`;
  }

  public ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);

    this.screenService.unlock();
  }

  public closeModal() {
    this.store$.dispatch(new GameCloseEmbeddedWidgetModal());
    window['gtag']('event', 'close', {event_category: 'embedding', event_label: this.tournament.title});
  }

  public copyToClipboard(e: Event) {
    if (window['gtag']) {
      window['gtag']('event', 'copy', {event_category: 'embedding', event_label: this.tournament.title});
    }
    try {
      const el = this.iframeCodeEl.nativeElement;
      el.style.fontSize = '19px';
      el.select();
      const oldContentEditable = el.contentEditable;
      const oldReadOnly = el.readOnly;
      const range = document.createRange();

      el.contentEditable = true;
      el.readOnly = false;
      range.selectNodeContents(el);

      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);

      el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

      el.contentEditable = oldContentEditable;
      el.readOnly = oldReadOnly;

      const status = document.execCommand('copy');

      if (!status) {
        console.error('Unable to copy.');
      }

      el.style.fontSize = null;
      (e.target as any).focus();

      this.showCopied$.next(true);

    } catch (err) {
      console.error('Unable to copy.');
    }
  }

  getRoundTitle(tour: ITour): string {
    if (tour) {
      if (tour.tour_round_name) {
        if (isNaN(+tour.tour_round_name)) {
          return `Round ${tour.tour_number} ${tour.tour_round_name}`
        } else {
          return `Round ${tour.tour_number}.${tour.tour_round_name}`;
        }
      } else {
        return `Round ${tour.tour_number}`;
      }
    } else {
      return '';
    }
  }
}
