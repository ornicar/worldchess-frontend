import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { BoardLoadService } from '../core/board/board-load.service';
import { IBoard } from '../core/board/board.model';
import { TourLoadService } from '../core/tour/tour-load.service';
import { Tournament } from '@app/broadcast/core/tournament/tournament.model';
import { TourResolveGuard } from '@app/broadcast/guards/tour-resolve.guard';
import { fromPromise } from 'rxjs/internal-compatibility';
import { BoardResourceService } from '@app/broadcast/core/board/board-resource.service';
import { ITour } from '@app/broadcast/core/tour/tour.model';
import { TourResourceService } from '../core/tour/tour-resource.service';

@Injectable()
export class BoardResolveGuard implements Resolve<IBoard> {
  constructor(
    private router: Router,
    private boardLoad: BoardLoadService,
    private tourLoad: TourLoadService,
    private tourResolveGuard: TourResolveGuard,
    private boardResourceService: BoardResourceService,
    private tourResourceService: TourResourceService,
  ) {
  }

  getBoardSlug(board: IBoard): string {
    return [board.white_player_name, board.black_player_name]
      .map(name => name.split(',').find(() => true))
      .join('-');
  }

  findTourBySlug(tournament: Tournament, tourSlug: string): Observable<ITour> {
    return this.tourResourceService.getByTournament(tournament.id).pipe(
      switchMap((tours: ITour[]) => {
        return tours ? of(tours.find((t: ITour) => tourSlug === this.tourResolveGuard.getTourSlug(t))) : of(null);
      }),
    );
  }

  resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IBoard> {
    const boardId = parseInt(routeSnapshot.params['pairing'], 10);
    const boardSlug = routeSnapshot.params['boardSlug'];
    const tourSlug = routeSnapshot.params['tour'];
    const tour = routeSnapshot.parent.data['tour'];
    const tournament = routeSnapshot.parent.data['tournament'];

    let observable: Observable<IBoard>;

    if (boardId && !isNaN(boardId)) {
      observable = this.boardLoad.getWithExpandAllWhenLacking(boardId)
                 .pipe(
                   mergeMap(board => {
                     return this.tourLoad.getWhenLacking(board.tour)
                                .pipe(
                                  map((boardTour) => {
                                    const complicatedSlug = [
                                      this.tourResolveGuard.getTourSlug(boardTour),
                                      this.getBoardSlug(board),
                                    ].join('/');

                                    return state.url.replace(
                                      routeSnapshot.routeConfig.path.replace(':pairing', routeSnapshot.params['pairing']),
                                      complicatedSlug,
                                    );
                                  }),
                                  mergeMap((url) => {
                                    console.log({ url });
                                    return fromPromise(this.router.navigateByUrl(url, { replaceUrl: true })).pipe(map(() => null));
                                  }),
                                );
                   }),
                 );
    } else if (boardSlug) {
      if (tourSlug && tournament) {
        observable = this.findTourBySlug(tournament, tourSlug).pipe(
          switchMap((t: ITour) => {
            return t ? this.boardResourceService.getByTourWithExpandAll(t.id)
            .pipe(mergeMap(({boards}) => {
               const board = boards.find(b => this.getBoardSlug(b) === boardSlug);
               return board ? of(board) : throwError(`Not found board by slug ${boardSlug}`);
            })) : of(null);
          }),
        );
      } else {
        const tourId = tour ? tour.id : tournament ? tournament.defaults.tour_id : null;
        observable = this.boardResourceService.getByTourWithExpandAll(tourId)
        .pipe(mergeMap(({boards}) => {
           const board = boards.find(b => this.getBoardSlug(b) === boardSlug);
           return board ? of(board) : throwError(`Not found board by slug ${boardSlug}`);
        }));
      }
    } else {
      observable = fromPromise(this.router.navigateByUrl('/not-found')).pipe(map(() => null));
    }

    return observable.pipe(catchError((err, caught: Observable<IBoard>) => {
      if (err) {
        return fromPromise(this.router.navigateByUrl('/not-found')).pipe(map(() => null));
      }
    }));
  }
}
