import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {IPlayerRating} from './player-rating.model';


export enum RatingTypeGame {
  CLASSIC = 'classic',
  BLITZ = 'blitz',
  RAPID = 'rapid',
}

interface IPlayerRatingOnDate {
  date: string;
  rating: string;
}

interface IGameStats {
  [color: string]: {name: string, value: number}[];
}

export interface IPlayerRatingStats {
  ratings: {
    [RatingTypeGame.CLASSIC]: IPlayerRatingOnDate[],
    [RatingTypeGame.BLITZ]: IPlayerRatingOnDate[],
    [RatingTypeGame.RAPID]: IPlayerRatingOnDate[],
  };
  game_stats: {
    [RatingTypeGame.CLASSIC]: IGameStats;
    [RatingTypeGame.BLITZ]: IGameStats;
    [RatingTypeGame.RAPID]: IGameStats;
  };
}

@Injectable()
export class PlayerRatingResourceService {

  constructor(private http: HttpClient) { }

  get(id: number) {
    return this.http.get<IPlayerRating>(`${environment.endpoint}/rating/${id}/`);
  }

  getAll(ordering = 'rank') {
    const params = new HttpParams().set('ordering', ordering);
    return this.http.get<IPlayerRating[]>(`${environment.endpoint}/rating/`, {params});
  }

  getPlayerStats(id: number) {
    return this.http.get<IPlayerRatingStats>(`${environment.endpoint}/players/${id}/stats/`);
  }
}
