import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { pluck, switchMap, take, tap, map, filter } from 'rxjs/operators';
import { IDefaultEntities } from '../models/default-entities';
import { TournamentResourceService } from './tournament-resource.service';
import * as TournamentActions from './tournament.actions';
import {CommonTournament, ITournament, TournamentResourceType} from './tournament.model';
import * as fromTournament from './tournament.reducer';

@Injectable()
export class TournamentLoadService {

  constructor(
    private store$: Store<fromTournament.State>,
    private tournamentResource: TournamentResourceService) { }

  public loadWithSave(id: number, resourcetype?: TournamentResourceType): Observable<CommonTournament> {
    return this.tournamentResource.getTournament(id, resourcetype).pipe(
      tap((tournament) => {
        this.store$.dispatch(new TournamentActions.AddTournament({ tournament }));
        this.store$.dispatch(new TournamentActions.AddTournamentDefaultEntities({ id, defaults: tournament.defaults }));
      })
    );
  }

  public loadFounderWithSave(id: number): Observable<CommonTournament> {
    return this.tournamentResource.getAllMy().pipe(
      tap((tournaments) => {
        this.store$.dispatch(new TournamentActions.AddTournaments({ tournaments }));
      }),
      map(tournaments => tournaments.find(tournament => tournament.id === id))
    );
  }

  public loadWithSaveBySlug(slug: string): Observable<CommonTournament> {
    return this.tournamentResource.getTournamentBySlug(slug).pipe(
      tap((tournament) => {
        this.store$.dispatch(new TournamentActions.AddTournament({ tournament }));
        this.store$.dispatch(new TournamentActions.AddTournamentDefaultEntities({ id: tournament.id, defaults: tournament.defaults }));
      })
    );
  }

  /**
   * Load from store or server.
   */
  getWhenLacking(id: number): Observable<CommonTournament> {
    return this.store$.pipe(
      select(fromTournament.selectEntities),
      take(1),
      switchMap(entities => entities[id]
        ? of(entities[id])
        : this.loadWithSave(id)
      )
    );
  }

  getFounderWhenLacking(id: number): Observable<CommonTournament> {
    return this.store$.pipe(
      select(fromTournament.selectEntities),
      take(1),
      switchMap(entities => entities[id]
        ? of(entities[id])
        : this.loadFounderWithSave(id)
      )
    );
  }

  getWhenLackingBySlug(slug): Observable<CommonTournament> {
    return this.store$.pipe(
      select(fromTournament.selectAllTournament),
      take(1),
      switchMap((entities) => {
        const tournament = entities.find(t => t.slug === slug);
        return tournament
          ? of(tournament)
          : this.loadWithSaveBySlug(slug);
      })
    );
  }

  getDefaults(id: number): Observable<IDefaultEntities> {
    return this.store$.pipe(
      select(fromTournament.selectTournamentsDefaultEntities),
      take(1),
      switchMap(defaultEntities => defaultEntities[id]
        ? of(defaultEntities[id])
        : this.loadWithSave(id).pipe(map(tournament => tournament.defaults))
      )
    );
  }


  getNewDefaults(id: number): Observable<IDefaultEntities> {
    return this.loadWithSave(id).pipe(map(tournament => tournament.defaults));
  }

  getCurrent(): Observable<CommonTournament> {
    return this.tournamentResource.current().pipe(
      tap(tournament => {
        this.store$.dispatch(new TournamentActions.AddTournament({ tournament }));
      })
    );
  }
}

