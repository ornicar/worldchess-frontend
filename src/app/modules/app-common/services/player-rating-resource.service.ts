import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, take, finalize, shareReplay } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as fromRoot from '@app/reducers';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  IPlayerRating,
  IPlayerRatingFIDE,
  IPlayerRatingItem,
  IPlayerRatingWorldChess,
  IPlayerRatingStats,
  IPlayerCompetitors, IPlayerStats
} from './player-rating.model';
import { Store } from '@ngrx/store';

@Injectable()
export class PlayerRatingResourceService {

  constructor(private http: HttpClient,
              private store$: Store<fromRoot.State>) {
  }

  private allCache$: Observable<IPlayerRating[]>;
  private allFideCache$: Observable<IPlayerRatingFIDE>;
  private allWorldChessCache$: Observable<IPlayerRatingWorldChess>;

  /**
   * rating for FIDE
   * @param id user id
   */
  get(id: number): Observable<IPlayerRating | any> {

    const responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});
    const loading$ = new BehaviorSubject<boolean>(false);

    return this.http.get<IPlayerRating>(`${environment.endpoint}/rating/${id}/`)
      .pipe(
        take(1),
        catchError(({error}) => {
          responseErrors$.next(error);
          return of({}); // EMPTY
        }),
        finalize(() => {
          loading$.next(false);
        })
      );
  }

  /**
   * ratings for FIDE
   * @param ordering
   * @param limit
   */
  getAll(ordering = 'rank', limit: number = 100): Observable<IPlayerRating[]> {
    const params = new HttpParams()
      .set('ordering', ordering)
      .set('limit', String(limit));
    if (!this.allCache$) {
      this.allCache$ = this.http.get<IPlayerRating[]>(`${environment.endpoint}/rating/`, {params})
        .pipe(shareReplay(1));
    }
    return this.allCache$;
  }

  /**
   * url: online/ratings/fide/
   * @param ordering
   * @param limit
   */
  getAllFIDE(
    limit: number = 100,
    offset: number = 0,
    ordering: string = 'rank'): Observable<IPlayerRatingFIDE> {
    const params = new HttpParams()
      .set('ordering', ordering)
      .set('limit', String(limit))
      .set('offset', String(offset));

    if (!this.allFideCache$) {
      this.allFideCache$ = this.http.get<IPlayerRatingFIDE>(`${environment.endpoint}/online/ratings/fide/`, {params})
        .pipe(shareReplay(1));
    }
    return this.allFideCache$;
  }

  getAllWorldChess(
    limit: number = 100,
    offset: number = 0,
    ordering: string = 'rank'): Observable<IPlayerRatingWorldChess> {

    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset))
      .set('ordering', ordering);

    if (!this.allWorldChessCache$) {
      this.allWorldChessCache$ = this.http.get<IPlayerRatingWorldChess>(`${environment.endpoint}/online/ratings/worldchess/`, {params})
        .pipe(shareReplay(1));
    }
    return this.allWorldChessCache$;
  }

  getPlayerStats(id: number): Observable<IPlayerRatingStats | any> {
    const loading$ = new BehaviorSubject<boolean>(false);

    return this.http.get<IPlayerRatingStats>(`${environment.endpoint}/players/${id}/stats/`)
      .pipe(
        take(1),
        finalize(
          () => {
            loading$.next(false);
          }
        )
      );
  }

  /**
   *
   * @param id
   * @param rating_type 'fide' | 'worldchess'
   */
  getPlayerStatsType(id: number, rating_type: string = 'fide'): Observable<IPlayerRatingStats | null> {
    const responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});
    const loading$ = new BehaviorSubject<boolean>(false);

    return this.http.get<IPlayerRatingStats | any>(`${environment.endpoint}/online/players/${id}/stats?rating_type=${rating_type}`)
      .pipe(
        take(1),
        catchError(({error}) => {
          responseErrors$.next(error);
          return of({}); // EMPTY
        }),
        finalize(() => {
          loading$.next(false);
        })
      );
  }

  /**
   *
   * @param id
   * @param rating_type 'fide' | 'worldchess'
   */
  getPlayerGeneralStat(id: number): Observable<IPlayerStats | null> {
    const responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});
    const loading$ = new BehaviorSubject<boolean>(false);

    return this.http.get<IPlayerStats | any>(`${environment.endpoint}/online/players/${id}`)
      .pipe(
        take(1),
        catchError(({error}) => {
          responseErrors$.next(error);
          return of({}); // EMPTY
        }),
        finalize(() => {
          loading$.next(false);
        })
      );
  }

  /**
   *
   */
  getBestPlayers(): Observable<IPlayerCompetitors[]> {
    const responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});
    const loading$ = new BehaviorSubject<boolean>(false);

    return this.http.get<IPlayerCompetitors[] | any>(`${environment.endpoint}/online/best-players/`)
      .pipe(
        take(10),
        catchError(({error}) => {
          responseErrors$.next(error);
          return of([]); // EMPTY
        }),
        finalize(() => {
          loading$.next(false);
        })
      );
  }

  getBest10Players(rating_type?:'worldchess' | 'fide'):Observable<IPlayerCompetitors[]> {
    const responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});
    const loading$ = new BehaviorSubject<boolean>(false);

    return this.http.get<IPlayerCompetitors[] | any >(`${environment.endpoint}/online/top10-players`,{
      params:{rating_type}
    })
      .pipe(
        take(10),
        catchError( ({error}) => {
          responseErrors$.next(error);
          return of([]); //? EMPTY
        }),
        finalize( () => {
          loading$.next(false);
        })
      );
  }

  getBestPlayer(): Observable<IPlayerCompetitors> {
    return this.getBestPlayers().pipe(map(arr => arr && arr.length > 0 ? arr[0] : {player_id: NaN, profile: {}}));
  }

  getIdFIDE(id: number = 0, token: string | null = null): Observable<IPlayerRatingItem | any> {

    const responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});
    const loading$ = new BehaviorSubject<boolean>(false);
    const httpOptions = {
      headers: new HttpHeaders()
    };

    if (token) {
      httpOptions.headers = new HttpHeaders({
        'Authorization': `JWT ${token}`
      });
    }
    return this.http.get<IPlayerRatingItem>(`${environment.endpoint}/online/ratings/fide/${id}/`, httpOptions)
      .pipe(
        take(1),
        catchError(({error}) => {
          responseErrors$.next(error);
          return of({});
        }),
        finalize(() => {
          loading$.next(false);
        })
      );
  }


  getIdWorldChess(id: number = 0, token: string | null = null): Observable<IPlayerRatingItem | any> {

    const responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});
    const loading$ = new BehaviorSubject<boolean>(false);

    const httpOptions = {
      headers: new HttpHeaders()
    };

    if (token) {
      httpOptions.headers = new HttpHeaders({
        'Authorization': `JWT ${token}`
      });
    }

    return this.http.get<IPlayerRatingItem>(`${environment.endpoint}/online/ratings/worldchess/${id}/`, httpOptions)
      .pipe(
        take(1),
        catchError(({error}) => {
          responseErrors$.next(error);
          return of({});
        }),
        finalize(() => {
          loading$.next(false);
        })
      );
  }

  // TODO: change section on enum
  getAllRating(section: string | undefined): Observable<IPlayerRating[]> {
    let ratings$ = null;
    switch (section) {
      case 'passport-online': {
        ratings$ = this.getAllFIDE()
          .pipe(
            map(ratings => {
              return ratings.results.map(p => {
                return {
                  avatar: p.profile.avatar['full'],
                  portrait: p.profile.avatar['full'],
                  birth_year: p.profile.birth_date || 2000,
                  federation: p.profile.country || 1,
                  fide_id: Number(p.player_id),
                  full_name: p.profile.full_name,
                  labels: [],
                  national: p.profile.country || 1,
                  rank: p.rank || 0,
                  worldchess_rank: p.worldchess_rank,
                  fide_rank: p.fide_rank,
                  blitz_rating: p.fide_blitz,
                  rapid_rating: p.fide_rapid,
                  rating: p.rating,
                  worldchess_bullet: p.worldchess_bullet,
                  fide_bullet: p.fide_bullet,
                  title: 'GM'
                };
              });
            })
          );
      }
        break;
      case 'world-chess': {
        ratings$ = this.getAllWorldChess()
          .pipe(
            map(ratings => {
              return ratings.results.map(p => {
                return {
                  avatar: p.profile.avatar['full'],
                  portrait: p.profile.avatar['full'],
                  birth_year: p.profile.birth_date || 2000,
                  federation: p.profile.country || 1,
                  fide_id: Number(p.player_id),
                  full_name: p.profile.full_name,
                  labels: [],
                  national: p.profile.country || 1,
                  rank: p.rank || 0,
                  rating: p.rating,
                  worldchess_rank: p.worldchess_rank,
                  fide_rank: p.fide_rank,
                  blitz_rating: p.worldchess_blitz,
                  rapid_rating: p.worldchess_rapid,
                  worldchess_bullet: p.worldchess_bullet,
                  fide_bullet: p.fide_bullet,
                  title: 'GM'
                };
              });
            })
          );
      }
        break;
      default: {
        ratings$ = this.getAll();
      }
        break;
    }
    return ratings$;
  }
}
