import { AfterViewInit, Component, Input, OnInit, ViewChild, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as TournamentActions from '../../../broadcast/core/tournament/tournament.actions';
import {
  BroadcastType,
  CommonTournament,
  FounderTournament,
  IGetTournamentsOptions,
  Tournament,
  TournamentState,
  TournamentStatus,
} from '../../../broadcast/core/tournament/tournament.model';
import * as fromTournament from '../../../broadcast/core/tournament/tournament.reducer';
import { getTournamentState } from '../../../broadcast/core/tournament/tournament.reducer';
import { select, Store } from '@ngrx/store';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { selectMyAccount } from '../../../account/account-store/account.reducer';
import { IOrder, IAccount } from '../../../account/account-store/account.model';
import { TournamentListComponent } from '../../../components/tournament-list/tournament-list.component';
import { selectIsAuthorized } from '../../../auth/auth.reducer';
import { Subscriptions, SubscriptionHelper } from '../../../shared/helpers/subscription.helper';

@Component({
  selector: 'wc-main-broadcast-list',
  templateUrl: './main-broadcast-list.component.html',
  styleUrls: ['./main-broadcast-list.component.scss']
})
export class MainBroadcastListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  isNoneFide: boolean = undefined;

  @Output() onBuyBroadcast = new EventEmitter<FounderTournament>();

  @ViewChild(TournamentListComponent)
  tournamentListCmp: TournamentListComponent;

  displayShowMoreBtn = false;
  tournamentListPageSize = 6;

  tournaments: FounderTournament[] = [];
  account$ = this.store$.select(selectMyAccount).pipe(
      filter(account => Boolean(account))
  );

  tournaments$: Observable<Tournament[]>;
  tournamentsList$: Observable<Tournament[]>;

  private page$ = new BehaviorSubject(1);

  isAuthorized$ = this.store$.select(selectIsAuthorized);
  tournamentWishList$ = this.store$.select(fromTournament.selectTournamentWishList);
  addTournamentToWishListError$ = this.store$.select(fromTournament.selectAddToWishListError);

  subs: Subscriptions = {};

  constructor(
    private router: Router,
    private store$: Store<fromTournament.State>,
  ) { }

  ngOnInit() {
    this.tournaments$ = this.store$.pipe(
      select(this.isNoneFide ? fromTournament.selectNoneFideTournaments : fromTournament.selectAllTournament),
      map((t: CommonTournament[]) => this.tournamentsSortByOngoing(t))
    );

    this.tournamentsList$ = combineLatest(this.tournaments$, this.page$)
      .pipe(map(([tournaments, page]) => {
        if (!tournaments) {
          return tournaments;
        }
        const nextCount = (page - 1) * this.tournamentListPageSize + this.tournamentListPageSize;
        this.displayShowMoreBtn = tournaments.length > nextCount;
        this.tournamentListCmp.scrollDown();
        return tournaments.slice(0, nextCount);
      }));
  }

  ngAfterViewInit() {
    this.tournamentListPageSize = this.tournamentListCmp.getCountInLine();
    const options: IGetTournamentsOptions = {};
    if (this.isNoneFide === undefined) {
      options.watch_now = 'True';
    } else {
      options.fide = this.isNoneFide ? 'False' : 'True';
    }

    this.store$.dispatch(new TournamentActions.GetTournaments({ options }));
    this.subs.authorized = this.isAuthorized$.subscribe((isAuthorized) => {
      return isAuthorized && this.store$.dispatch(new TournamentActions.GetTournamentWishList());
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  showMore() {
    this.page$.next(this.page$.value + 1);
  }

  // @todo: get sorted list form BE
  tournamentsSortByOngoing(tournaments: Tournament[]) {
    return tournaments.sort((t1, t2) => {
      if (!t1.datetime_of_tournament && !t2.datetime_of_tournament) {
        return 0;
      }

      if (!t1.datetime_of_tournament !== !t2.datetime_of_tournament) {
        return (!!t1.datetime_of_tournament) ? -1 : 1;
      }

      if (t1.datetime_of_tournament === t2.datetime_of_tournament) {
        return 0;
      }
      const now = moment.now();
      if (moment(t1.datetime_of_finish).isBefore(now) !== moment(t2.datetime_of_finish).isBefore(now)) {
        return moment(t1.datetime_of_finish).isBefore(now) ? 1 : -1;
      }

      const d1 = moment(t1.datetime_of_tournament);
      const d2 = moment(t2.datetime_of_tournament);
      return d1.isAfter(d2) ? 1 : -1;
    });
  }

  isLive(tournament: FounderTournament) {
    return getTournamentState(tournament) === TournamentState.Live;
  }

  canWatch(tournament: FounderTournament): Observable<boolean> {
    if (tournament.broadcast_type === BroadcastType.FREE && tournament.status === TournamentStatus.EXPECTED) {
      return of(false);
    }

    if (tournament.broadcast_type === BroadcastType.FREE && tournament.status === TournamentStatus.GOES) {
      return of(true);
    }

    return this.account$.pipe(
      switchMap((account) => {
        if (tournament.broadcast_type === BroadcastType.PAY && tournament.status === TournamentStatus.EXPECTED && account.premium) {
          return of(false);
        }

        const tournamentsIds = this.getTournamentsIdsFromOrders(account.orders);
        if (
          (tournament.broadcast_type === BroadcastType.PAY && tournament.status === TournamentStatus.GOES) &&
          (account.premium || tournamentsIds.includes(tournament.id))
        ) {
          return of(true);
        }

        if (
          tournament.broadcast_type === BroadcastType.ONLY_TICKET &&
          tournament.status === TournamentStatus.GOES &&
          tournamentsIds.includes(tournament.id)) {
            return of(true);
        }

        return of(false);
      })
    );
  }

  canBuy(tournament: FounderTournament): Observable<boolean> {
    if (tournament.broadcast_type === BroadcastType.FREE && tournament.status === TournamentStatus.EXPECTED) {
      return of(false);
    }

    return this.account$.pipe(
      switchMap((account) => {
        if (tournament.broadcast_type === BroadcastType.PAY && tournament.status === TournamentStatus.EXPECTED && account.premium) {
          return of(false);
        }

        if (tournament.broadcast_type === BroadcastType.PAY && !account.premium && !!tournament.ticket_price && !!tournament.product) {
          return of(true);
        }

        const tournamentsIds = this.getTournamentsIdsFromOrders(account.orders);
        if (tournament.broadcast_type === BroadcastType.ONLY_TICKET && !tournamentsIds.includes(tournament.id) && !!tournament.ticket_price && !!tournament.product) {
          return of(true);
        }


        return of(false);
      })
    );
  }

  canAddToWishList(tournament: FounderTournament): Observable<boolean> {

    if (moment(tournament.datetime_of_tournament).isBefore()) {
      return of(false);
    }

    return this.tournamentWishList$.pipe(
      switchMap(wishList => {
        const entry = wishList.find(e => e.tournament === tournament.id);
        if (!!entry) {
          return of(false);
        }

        if (tournament.broadcast_type === BroadcastType.FREE && tournament.status === TournamentStatus.EXPECTED) {
          return of(true);
        }

        return this.account$.pipe(
          switchMap((account: IAccount) => {
            const tournamentsIds = this.getTournamentsIdsFromOrders(account.orders);
            if (tournament.broadcast_type === BroadcastType.PAY &&
                tournament.status === TournamentStatus.EXPECTED &&
                (account.premium || tournamentsIds.includes(tournament.id))) {
              return of(true);
            }

            if (tournament.broadcast_type === BroadcastType.ONLY_TICKET && tournament.status === TournamentStatus.EXPECTED && tournamentsIds.includes(tournament.id)) {
              return of(true);
            }

            return of(false);
          })
        );
      })
    )
  }

  canRemoveFromWishList(tournament: FounderTournament): Observable<boolean> {

    if (moment(tournament.datetime_of_tournament).isBefore()) {
      return of(false);
    }

    return this.tournamentWishList$.pipe(
      switchMap(wishList => {
        const entry = wishList.find(e => e.tournament === tournament.id);
        return of(!!entry);
      })
    );
  }

  addToWishList(event: MouseEvent, tournament: FounderTournament) {
    event.preventDefault();
    event.stopPropagation();
    this.isAuthorized$.pipe(
      take(1)
    ).subscribe((isAuthorized) => {
      if (isAuthorized) {
        this.store$.dispatch(new TournamentActions.AddTournamentToWishList({ tournament: tournament.id }));
      } else {
        this.router.navigate(['/sign-in']);
      }
    });
  }

  removeFromWishList(event: MouseEvent, tournament: FounderTournament) {
    event.preventDefault();
    event.stopPropagation();
    this.isAuthorized$.pipe(
      take(1)
    ).subscribe((isAuthorized) => {
      if (isAuthorized) {
        this.store$.dispatch(new TournamentActions.RemoveTournamentFromWishList({ tournament: tournament.id }));
      } else {
        this.router.navigate(['/sign-in']);
      }
    });
  }

  onClickItem(tournament: Tournament) {
    this.router.navigate(['/tournament', tournament.id]);
  }

  getTournamentsIdsFromOrders(orders: IOrder[]): number[] {
    if (orders.length === 0) {
      return [];
    }

    return orders.filter(order => order.product && order.product.tournament).map(order => order.product.tournament.id);
  }

  buyBroadcast(event: MouseEvent, tournament: FounderTournament) {
    event.stopPropagation();
    this.onBuyBroadcast.emit(tournament);
  }
}
