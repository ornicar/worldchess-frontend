import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges, OnDestroy,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { IResultRecord, Result } from '../../core/result/result.model';
import { ActivatedRoute } from '@angular/router';
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  pluck,
  takeUntil,
  throttleTime,
  take,
} from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { ITour } from '@app/broadcast/core/tour/tour.model';
import { combineLatest, interval, Observable, ReplaySubject, Subject } from 'rxjs';
import { selectToursByTournament } from '@app/broadcast/components/header/header.component';
import * as fromRoot from '@app/reducers';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { Tournament } from '@app/broadcast/core/tournament/tournament.model';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { ResultsListPopupComponent } from '../results-list-popup/results-list-popup.component';

interface IRound {
  number: number;
  tours: ITour[];
  pairs: any[];
  results: IResultRecord[];
}

@Component({
  selector: 'wc-results-list-playoff',
  templateUrl: './results-list-playoff.component.html',
  styleUrls: ['./results-list-playoff.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsListPlayoffComponent implements AfterContentInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() results: IResultRecord[];
  results$ = new ReplaySubject<IResultRecord[]>();
  tournament$ = new ReplaySubject<Tournament>();

  redraw$ = new Subject<void>();
  destroy$ = new Subject();

  maxHeight = 'auto';

  showPopup = false;
  popupPlayer: IPlayer = null;
  popupPlayerName = '';
  popupResults: IResultRecord[] = [];

  public carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 2, md: 3, lg: 4, all: 0 },
    touch: false,
    loop: false,
    point: { visible: false },
    speed: 250,
  };

  @ViewChildren('rounds', {read: ElementRef}) rounds: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('pairs', {read: ElementRef}) pairs: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('carousel', { static: false }) carousel: NguCarousel<any>;
  @ViewChild('carousel', { static: false, read: ElementRef }) carouselER: ElementRef;
  @ViewChild(ResultsListPopupComponent, { static: false }) popup: ResultsListPopupComponent;

  curves = [];

  tournamentId$ = this.activatedRoute.data.pipe(
    pluck('tournament', 'id'),
    filter(v => !!v),
    distinctUntilChanged(),
  );

  tours$ = this.tournamentId$.pipe(
    mergeMap(tournamentId => this.store$.pipe(select(selectToursByTournament, { tournamentId }))),
    map((tours: ITour[]) => {
      const orderedTours = [...tours];
      orderedTours.sort((a, b) => {
        return a.tour_number - b.tour_number ||
          new Date(a.datetime_of_round_finish).getTime() - new Date(b.datetime_of_round_finish).getTime();
      });
      return orderedTours;
    }),
  );

  rounds$: Observable<IRound[]> = this.tours$.pipe(map((tours) => {
    return Object.values(tours.reduce((result, next) => {
      if (!result[next.tour_number]) {
        result[next.tour_number] = {
          number: next.tour_number,
          tours: [],
        };
      }

      result[next.tour_number].tours.push(next);
      return result;
    }, {}));
  }));

  list$ = combineLatest([
    this.rounds$,
    this.results$.pipe(filter(v => !!v)),
  ]).pipe(map(([rounds, results]) => {

    rounds = rounds.sort((a, b) => a.number - b.number);

    const resultsMap = results.reduce((r, next) => {
      if (!r[next.tour_id]) {
        r[next.tour_id] = [];
      }
      r[next.tour_id].push(next);
      return r;
    }, {});

    rounds.forEach((round, rIndex) => {
      round.results = [];
      round.tours.forEach((tour) => {
        if (!resultsMap[tour.id]) {
          return;
        }
        round.results.push(...resultsMap[tour.id]);
      });

      round.pairs = Object.values(round.results.reduce((r, next) => {
        const playerOne = next.white_player ? next.white_player.full_name : next.white_player_name;
        const playerTwo = next.black_player ? next.black_player.full_name : next.black_player_name;
        if (r[playerOne] || r[playerTwo]) {
          const item = r[playerOne] || r[playerTwo];
          item.results.push(next);
          if (item.playerOne.name === playerOne && !item.playerOne.player && next.white_player) {
            item.playerOne.player = next.white_player;
          } else if (item.playerTwo.name === playerOne && !item.playerTwo.player && next.white_player) {
            item.playerTwo.player = next.white_player;
          }
          if (item.playerOne.name === playerTwo && !item.playerOne.player && next.black_player) {
            item.playerOne.player = next.black_player;
          } else if (item.playerTwo.name === playerTwo && !item.playerTwo.player && next.black_player) {
            item.playerTwo.player = next.black_player;
          }
          if (item.playerOne.name === playerOne) {
            item.playerOne.results.push(this.getResultFor(playerOne, next));
          } else if (item.playerTwo.name === playerOne) {
            item.playerTwo.results.push(this.getResultFor(playerOne, next));
          }
          if (item.playerTwo.name === playerTwo) {
            item.playerTwo.results.push(this.getResultFor(playerTwo, next));
          } else if (item.playerOne.name === playerTwo) {
            item.playerOne.results.push(this.getResultFor(playerTwo, next));
          }
        } else {
          r[playerOne] = {
            playerOne: {
              name: playerOne,
              player: next.white_player,
              results: [
                this.getResultFor(playerOne, next),
              ],
            },
            playerTwo: {
              name: playerTwo,
              player: next.black_player,
              results: [
                this.getResultFor(playerTwo, next),
              ],
            },
            results: [next],
          };
        }
        return r;
      }, {}));

      if (!round.pairs.length) {
        round.pairs = new Array(
          rounds[rIndex - 1] ? Math.floor(rounds[rIndex - 1].pairs.length / 2) : 1,
        ).fill({
          playerOne: {
            name: '',
            player: undefined,
            results: [],
          },
          playerTwo: {
            name: '',
            player: undefined,
            results: [],
          },
          results: [],
        });
      }

      round.pairs = round.pairs.map(p => {
        p.playerOne.result = p.playerOne.results.reduce((r, n) => +r + (+n), 0);
        p.playerTwo.result = p.playerTwo.results.reduce((r, n) => +r + (+n), 0);
        p.playerOne.win = p.playerOne.result > p.playerTwo.result;
        p.playerOne.lose = p.playerOne.result < p.playerTwo.result;
        p.playerTwo.win = p.playerTwo.result > p.playerOne.result;
        p.playerTwo.lose = p.playerTwo.result < p.playerOne.result;
        p.playerOne.half = p.playerTwo.half = Math.floor(p.playerOne.result) !== p.playerOne.result && (p.playerOne.result > 0 || p.playerTwo.result > 0);
        p.playerOne.result = Math.floor(p.playerOne.result);
        p.playerTwo.result = Math.floor(p.playerTwo.result);
        p.playerOne.results = p.playerOne.results.concat(new Array(9 - p.playerOne.results.length).fill('0'));
        p.playerTwo.results = p.playerTwo.results.concat(new Array(9 - p.playerTwo.results.length).fill('0'));
        return p;
      });
    });

    return rounds.reverse().map((round, index) => {
      if (rounds[index - 1]) {
        round.pairs = round.pairs.sort((a, b) => {
          const aIndex = rounds[index - 1].pairs.findIndex((p) => {
            return p.playerOne.name === a.playerOne.name || p.playerOne.name === a.playerTwo.name ||
              p.playerTwo.name === a.playerTwo.name || p.playerTwo.name === a.playerOne.name;
          });

          const bIndex = rounds[index - 1].pairs.findIndex((p) => {
            return p.playerOne.name === b.playerOne.name || p.playerOne.name === b.playerTwo.name ||
              p.playerTwo.name === b.playerTwo.name || p.playerTwo.name === b.playerOne.name;
          });
          return aIndex - bIndex;
        });
      }
      return round;
    }).reverse();

  }), takeUntil(this.destroy$));

  isMobile = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store$: Store<fromRoot.State>,
    private cdr: ChangeDetectorRef,
    private screenState: ScreenStateService,
  ) {

    this.screenState.matchMediaMobileSmall$
        .pipe(
          takeUntil(this.destroy$),
        )
        .subscribe((isMobile) => this.isMobile = isMobile);

    interval(50).pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => this.redraw$.next());

    this.redraw$
        .pipe(
          throttleTime(10),
          takeUntil(this.destroy$),
        )
        .subscribe(() => this.drawCurves());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['results']) {
      this.results$.next(changes['results'].currentValue);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getResultFor(playerName: string, result: IResultRecord) {
    if (result.result === null) {
      return '0';
    } else if (result.result === Result.DRAW) {
      return 0.5;
    } else if (result.result === Result.NOT_PLAYED) {
      return -1;
    } else {
      if (result.black_player_name === playerName) {
        return result.result === Result.BLACK_WIN ? 1 : 0;
      } else if (result.white_player_name === playerName) {
        return result.result === Result.WHITE_WIN ? 1 : 0;
      } else if (result.black_player && result.black_player.full_name === playerName) {
        return result.result === Result.BLACK_WIN ? 1 : 0;
      } else if (result.white_player && result.white_player.full_name === playerName) {
        return result.result === Result.WHITE_WIN ? 1 : 0;
      }
    }
  }

  ngAfterViewInit() {
    this.redraw$.next();
  }

  ngAfterContentInit() {
    this.redraw$.next();
  }

  async carouselMove() {
    if (this.isMobile) {
      window.scrollTo({
        top: this.carouselER.nativeElement.getBoundingClientRect().top +
          window.scrollY -
          70
      });
      const round = this.rounds.find((_, index) => this.carousel.currentSlide === index);
      const maxHeight = round.nativeElement.querySelector('.rounds-wrapper').getBoundingClientRect().height;
      this.maxHeight = Math.max(maxHeight, 590) + 'px';
    } else {
      this.maxHeight = 'auto';
    }
    this.curves = [];
    await new Promise(resolve => setInterval(resolve, this.carouselConfig.speed * 2));
    this.redraw$.next();
  }

  onRoundScroll(e) {
    this.redraw$.next();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.redraw$.next();
  }

  drawCurves() {
    this.curves = [];
    if (!this.carousel) {
      return;
    }
    if (!this.carousel.items) {
      return;
    }
    const visiblePairs: Array<Array<ElementRef>> = new Array(this.carousel.items)
      .fill(null)
      .map((_, index) => this.carousel.currentSlide + index)
      .map((index) => this.rounds.find((_, ri) => index === ri))
      .map(roundElementRef => this.pairs.filter(p => {
        if (!p || !roundElementRef) {
          return false;
        }
        return roundElementRef.nativeElement.contains(p.nativeElement);
      }));

    if (visiblePairs.length < 2) {
      this.cdr.detectChanges();
      return;
    }

    const curves = [];

    visiblePairs.forEach((inRound, index) => {
      if (visiblePairs[index + 1]) {
        visiblePairs[index].forEach((pair, pairIndex) => {
          const to = visiblePairs[index + 1][Math.floor(pairIndex / 2)];
          if (!to) {
            return;
          }
          curves.push([
            pair.nativeElement,
            to.nativeElement,
          ]);
        });
      }
    });

    const bodyRect = this.carouselER.nativeElement.getBoundingClientRect();

    curves.forEach(([from, to]) => {
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const fromX = fromRect.x + fromRect.width;
      const fromY = fromRect.top + (fromRect.height / 2);
      const toX = toRect.x;
      const toY = toRect.top + (toRect.height / 2);
      const controlX = toX - fromX;
      const controlY = toY - fromY;
      const style = {
        top: Math.min(
          fromRect.y - bodyRect.top + (fromRect.height / 2) - 1,
          toRect.y - bodyRect.top + (fromRect.height / 2) - 1,
        ),
        left: fromRect.x + fromRect.width,
        height: Math.max(
          Math.abs(fromRect.top - toRect.bottom),
          Math.abs(toRect.top - fromRect.bottom),
        ) - fromRect.height + 2,
      };
      if (style.top < 30 || (style.top + style.height) > 650) {
        return;
      }
      this.curves.push({
        style,
        d: fromRect.top >= toRect.top ? `M0,${style.height} Q40,${style.height / 5 * 4} 40,0` : `M0,0 Q40,0 40,${style.height}`,
      });
    });

    this.cdr.detectChanges();
  }

  showPlayerPopup(player: IPlayer, name: string) {
    this.popupPlayer = player;
    this.popupPlayerName = name;
    const opponents = {};
    const playerName = player ? player.full_name : name;
    this.popupResults = this.results.filter(
      (result: IResultRecord) => {
        const isWhite = (result.white_player && result.white_player.full_name === playerName) ||
          (result.white_player_name && result.white_player_name === playerName);
        const isBlack = (result.black_player && result.black_player.full_name === playerName) ||
        (result.black_player_name && result.black_player_name === playerName);
        if (isWhite && result.black_player && typeof opponents[result.black_player.full_name] === 'undefined') {
          opponents[result.black_player.full_name] = result.black_player;
        } else if (isBlack && result.white_player && typeof opponents[result.white_player.full_name] === 'undefined') {
          opponents[result.white_player.full_name] = result.white_player;
        }
        return isWhite || isBlack;
      }
    );
    this.popupResults.forEach((result) => {
      if (!result.white_player && result.white_player_name && typeof opponents[result.white_player_name] !== 'undefined') {
        result.white_player = opponents[result.white_player_name];
      }
      if (!result.black_player && result.black_player_name && typeof opponents[result.black_player_name] !== 'undefined') {
        result.black_player = opponents[result.black_player_name];
      }
    });
    this.showPopup = true;
    if (this.isMobile && this.popup) {
      this.popup.scrollTo();
    }
    this.cdr.markForCheck();
  }

  closePlayerPopup() {
    this.showPopup = false;
    this.popupPlayer = null;
    this.popupPlayerName = '';
    this.popupResults = [];
    this.cdr.markForCheck();
  }

  public onSwipeRight(): void {
    if (!this.carousel.isFirst) {
      this.carousel.moveTo(this.carousel.currentSlide - 1);
    }
  }

  public onSwipeLeft(): void {
    if (!this.carousel.isLast) {
      this.carousel.moveTo(this.carousel.currentSlide + 1);
    }
  }
}
