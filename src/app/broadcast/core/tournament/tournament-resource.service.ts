import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { deserializeTournament } from './tournament.reducer';
import { environment } from '../../../../environments/environment';

import {
  ITournament,
  Tournament,
  FounderTournament,
  OnlineTournament,
  IGetTournamentsOptions,
  CommonTournament,
} from './tournament.model';
import { IPaginationResponse } from '../../chess-footer/team-players/team-players-resource.service';
import { ITour } from '../tour/tour.model';
import { IResultsLists } from '../result/result.model';
import { CommonModule } from '@angular/common';

@Injectable()
export class TournamentResourceService {

  constructor(private http: HttpClient) {
  }

  getTournament(id: number): Observable<CommonTournament> {
    return this.http.get<ITournament>(`${environment.endpoint}/tournaments/${id}/`).pipe(
      map(tournament => deserializeTournament(tournament)),
    );
  }

  getTournamentBySlug(slug: string): Observable<CommonTournament> {
    return this.http.get<ITournament>(`${environment.endpoint}/tournaments/slug/${slug}`).pipe(
      map(tournament => deserializeTournament(tournament)),
    )
  }

  getAll(options: IGetTournamentsOptions = {}): Observable<Array<CommonTournament>> {
    let params = new HttpParams()
      .set('limit', '100');

    Object.keys(options).forEach(o => params = params.set(o, options[o]));
    return this.http.get<IPaginationResponse<ITournament>>(`${environment.endpoint}/tournaments/`, { params })
      .pipe(map((r) => {
        return r.results.map(t => deserializeTournament(t))
      }));
  }


  current(): Observable<CommonTournament> {
    return this.http.get<ITournament>(`${environment.endpoint}/tournaments/current/`).pipe(
      map(tournament => deserializeTournament(tournament))
    );
  }

  getAllMy(): Observable<FounderTournament[]> {
    let params = new HttpParams();
    params = params.set('limit', '100');

    return this.http.get<ITournament[]>(`${environment.endpoint}/founder/tournaments/my/`, { params }).pipe(
      map((tournaments: ITournament[]) => tournaments.map(t => plainToClass<FounderTournament, object>(FounderTournament, t)))
    );
  }

  addMy(tournament): Observable<FounderTournament> {
    const formData = new FormData();
    Object.keys(tournament).forEach(key => {
      formData.append(key, tournament[key]);
    });
    return this.http.post<any>(`${environment.endpoint}/founder/tournaments/`, formData).pipe(
      map(tournament => plainToClass<FounderTournament, object>(FounderTournament, tournament))
    );
  }

  patchMy({changes, id}: { changes: Partial<FounderTournament>/* some field of tournament */, id: number }): Observable<FounderTournament> {
    const formData = new FormData();
    Object.keys(changes).forEach(key => {
      formData.append(key, changes[key]);
    });

    return this.http.patch<any>(`${environment.endpoint}/founder/tournaments/${id}/`, formData).pipe(
      map(tournament => plainToClass<FounderTournament, object>(FounderTournament, tournament))
    );
  }

  deleteMy(id: number) {
    return this.http.delete<any>(`${environment.endpoint}/founder/tournaments/${id}/`);
  }

  sendToApproveMy(id: number) {
    return this.http.post<any>(`${environment.endpoint}/founder/tournaments/${id}/approve/`, {}).pipe(
      map(() => id)
    );
  }

  getMyTournamentTours(tournamentId: number) {
    return this.http.get<ITour[]>(`${environment.endpoint}/founder/tournaments/${tournamentId}/tours/`);
  }

  addMyTournamentTour(tournamentId: number, tour: Partial<ITour>) {
    return this.http.post<ITour>(`${environment.endpoint}/founder/tournaments/${tournamentId}/tours/`, tour);
  }

  patchMyTournamentTour(tournamentId: number, tourId: number, tour: Partial<ITour>) {
    const { id, ...rest } = tour;
    if (rest.links &&
      (!rest.links.length || rest.links.every(value => value === null)))  {
      delete rest.links;
    }
    return this.http.patch<ITour>(`${environment.endpoint}/founder/tournaments/${tournamentId}/tours/${tourId}/`, rest);
  }

  deleteMyTournamentTour(tournamentId: number, tourId: number) {
    return this.http.delete<any>(`${environment.endpoint}/founder/tournaments/${tournamentId}/tours/${tourId}/`);
  }

  importPlayers(tournamentId: number, file: any) {
    return this.http.put(`${environment.endpoint}/founder/tournaments/${tournamentId}/players/`, file);
  }

  importBoard(tournamentId: number, tourId: number, file: any) {
    return this.http.put(`${environment.endpoint}/founder/tournaments/${tournamentId}/${tourId}/boards/`, file);
  }

  getFideTournamentResults(tournamentId: number): Observable<IResultsLists> {
    return this.http.get<IResultsLists>(`${environment.endpoint}/tournaments/${tournamentId}/results/`);
  }

  getFounderTournamentResults(tournamentId: number): Observable<IResultsLists> {
    return this.http.get<IResultsLists>(`${environment.endpoint}/founder/tournaments/${tournamentId}/results/`);
  }

  signupToTournament(tournamentId: number): Observable<OnlineTournament> {
    return this.http.post<OnlineTournament>(`${environment.endpoint}/online/tournaments/${tournamentId}/signup/`, null).pipe(
      map(tournament => plainToClass<OnlineTournament, object>(OnlineTournament, tournament))
    );
  }

  addTournamentToWishList(tournament: number) {
    return this.http.post(`${environment.endpoint}/me/wishlist/`, { tournament });
  }

  removeTournamentFromWishList(tournament: number) {
    return this.http.delete(`${environment.endpoint}/me/wishlist/${tournament}/`);
  }

  getTournamentWishList() {
    return this.http.get<number[]>(`${environment.endpoint}/me/wishlist/`);
  }
}
