import { ActivatedRoute } from '@angular/router';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { distinctUntilChanged, map, takeUntil, mergeMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { SearchPlayerHelper } from '../search-player.helper';
import { IPlayerRating } from '../../../app-common/services/player-rating.model';
import { PlayerRatingResourceService } from '@app/modules/app-common/services/player-rating-resource.service';

@Component({
  selector: 'wc-player-list-tail',
  templateUrl: './player-list-tail.component.html',
  styleUrls: ['./player-list-tail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerListTailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() searchQuery = '';

  @OnChangesInputObservable()
  searchQuery$ = new BehaviorSubject<string>(this.searchQuery);

  public playersList$ = new BehaviorSubject([]);
  public section = '';
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private ratingResource: PlayerRatingResourceService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(
      mergeMap(params => combineLatest(
          this.ratingResource.getAllRating(params.section),
          this.searchQuery$.pipe(distinctUntilChanged())
      ).pipe(map(SearchPlayerHelper.filterPlayers))),
      tap(() => this.cd.markForCheck()),
      takeUntil(this.destroy$)
    ).subscribe(this.playersList$);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
  }

  calcTileColor(player: IPlayerRating, index: number): string {
    if (!player.labels.length) {
      return index < 10 ? 'rating-tile__elem--king' : '';
    } else {
      const label = player.labels[0];
      if (label === "#1") {
        return 'rating-tile__elem--king';
      } else {
        return `rating-tile__elem--${player.labels[0]}`;
      }
    }
  }

 getRatingClassic(player: IPlayerRating): number {
  let rating = 0;
  switch ( this.route.snapshot.queryParamMap.get('section') ) {
    case 'passport-online' : {
      rating = player.fide_bullet;
    } break;
    case 'world-chess' : {
      rating = player.worldchess_bullet;
    } break;
    default: {
      rating = player.rating;
    } break;
  }
  return rating;
 }
}
