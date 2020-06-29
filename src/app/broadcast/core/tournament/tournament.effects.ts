import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap, first, catchError, take } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { TournamentResourceService } from './tournament-resource.service';
import {
  AddTournament,
  AddTournaments,
  GetTournament,
  GetTournaments,
  LoadTournaments,
  TournamentActionTypes,
  GetMyTournaments,
  PatchMyTournament,
  UpdateTournament,
  DeleteMyTournament,
  DeleteTournament,
  CreateMyTournament,
  PatchMyTournamentAndNavigate,
  SetMyTournamentErrors,
  SendToApproveMyTournament,
  GetFideTournamentResults,
  LoadTournamentResults,
  SignupToTournament,
  SignupToTournamentSuccess,
  SignupToTournamentError,
  UpdateOnlineTournaments,
  UpdateTournaments,
  GetFounderTournamentResults,
  AddTournamentToWishList,
  TournamentWishListSuccess,
  TournamentWishListError,
  GetTournamentWishList,
  LoadTournamentWishList,
  RemoveTournamentFromWishList,
  LeaveFromTournament,
} from './tournament.actions';
import * as fromRoot from '../../../reducers';
import { ApprovalStatus, Tournament, TournamentResourceType } from './tournament.model';
import { Router } from '@angular/router';
import { selectTournamentWishList, deserializeTournament } from './tournament.reducer';


@Injectable()
export class TournamentEffects {

  constructor(
    private actions$: Actions,
    private tournamentResource: TournamentResourceService,
    private store$: Store<fromRoot.State>,
    private router: Router) { }

  @Effect()
  getTournament$: Observable<Action> = this.actions$.pipe(
    ofType<GetTournament>(TournamentActionTypes.GetTournament),
    switchMap((action) => this.tournamentResource.getTournament(action.payload.id, action.payload.resourcetype).pipe(
      map((tournament) => {
        return new AddTournament({ tournament });
      })
    ))
  );

  @Effect()
  getTournaments$: Observable<Action> = this.actions$.pipe(
    ofType<GetTournaments>(TournamentActionTypes.GetTournaments),
    switchMap((action) => {
      let tournamentsData$ = this.tournamentResource.getAll(action.payload.options);

      return tournamentsData$.pipe(
        map(data => new LoadTournaments({ tournaments: data }))
      );
    })
  );

  @Effect()
  updateOnlineTournaments$: Observable<Action> = this.actions$.pipe(
    ofType<UpdateOnlineTournaments>(TournamentActionTypes.UpdateOnlineTournaments),
    switchMap((action) => {
      return this.tournamentResource.getAll({ resourcetype: TournamentResourceType.OnlineTournament }).pipe(
        map(tournaments => new UpdateTournaments({
          tournaments: tournaments.map(tournament => Object.assign({}, { id: tournament.id, changes: tournament }))
        }))
      );
    }
    )
  );

  //
  // My tournaments
  //
  @Effect()
  getMyTournaments$: Observable<Action> = this.actions$.pipe(
    ofType<GetMyTournaments>(TournamentActionTypes.GetMyTournaments),
    switchMap(() => this.tournamentResource.getAllMy()
      .pipe(
        map(tournaments => new AddTournaments({ tournaments }))
      )
    )
  );

  @Effect()
  addNewMyTournament$: Observable<Action> = this.actions$.pipe(
    ofType<CreateMyTournament>(TournamentActionTypes.CreateMyTournament),
    switchMap((action) => this.tournamentResource.addMy(action.payload.tournament)
      .pipe(
        tap((tournament) =>
          this.router.navigate([
            `/account/events/create/${tournament.id}/added`
          ])
        ),
        map((tournament: Tournament) => new AddTournament({ tournament })),
        catchError((error) => {
          console.log('Error on creating: ', error); return of(new SetMyTournamentErrors({
            errors: error.error
          }));
        }),
      )
    ),
  );

  @Effect()
  patchMyTournament$: Observable<Action> = this.actions$.pipe(
    ofType<PatchMyTournament>(TournamentActionTypes.PatchMyTournament),
    switchMap((action) => this.tournamentResource.patchMy(action.payload)
      .pipe(
        map(tournament => new UpdateTournament({ tournament: { id: tournament.id, changes: tournament } })),
        catchError((error) => {
          console.log('Error on edition: ', error); return of(new SetMyTournamentErrors({
            errors: error.error
          }));
        })
      )
    ),
  );

  @Effect()
  patchMyTournamentAndNavigate$: Observable<Action> = this.actions$.pipe(
    ofType<PatchMyTournamentAndNavigate>(TournamentActionTypes.PatchMyTournamentAndNavigate),
    switchMap((action) => this.tournamentResource.patchMy(action.payload)
      .pipe(
        tap((tournament) =>
          this.router.navigate([
            `/account/events/create/${tournament.id}/${action.payload.route}`
          ])
        ),
        map(tournament => new UpdateTournament({ tournament: { id: tournament.id, changes: tournament } })),
        catchError((error) => {
          console.log('Error on edition: ', error); return of(new SetMyTournamentErrors({
            errors: error.error
          }));
        })
      )
    )
  );

  @Effect()
  deleteMyTournament$: Observable<Action> = this.actions$.pipe(
    ofType<DeleteMyTournament>(TournamentActionTypes.DeleteMyTournament),
    switchMap((action) => this.tournamentResource.deleteMy(action.payload.id).pipe(
      map(() => new DeleteTournament({ id: action.payload.id }))
    ))
  );

  @Effect()
  sendToApproveMyTournament$: Observable<Action> = this.actions$.pipe(
    ofType<SendToApproveMyTournament>(TournamentActionTypes.SendToApproveMyTournament),
    switchMap((action) => this.tournamentResource.sendToApproveMy(action.payload.id).pipe(
      tap(() =>
        this.router.navigate([
          `/account/events/list`
        ])
      ),
      map(tournamentId => new UpdateTournament({ tournament: { id: tournamentId, changes: { approve_status: ApprovalStatus.REQUESTED} } })),
      catchError((error) => {
        console.log('Error on sending to approve: ', error); return of(new SetMyTournamentErrors({
          errors: error.error
        }));
      }))
    ));

  @Effect()
  signupToTournament$: Observable<Action> = this.actions$.pipe(
    ofType<SignupToTournament>(TournamentActionTypes.SignupToTournament),
    map((action) => action.payload.id),
    switchMap((id) => this.tournamentResource.signupToTournament(id).pipe(
      switchMap((tournament) => [
        new GetTournament({ id: tournament.id, resourcetype: TournamentResourceType.OnlineTournament }),
        new SignupToTournamentSuccess({ tournament }),
      ]),
      catchError(response => of(new SignupToTournamentError({
        message: response.error ? Object.values(response.error).toString() : 'Unknown error',
       })))
    )
    )
  );

  @Effect()
  leaveFromTournament$: Observable<Action> = this.actions$.pipe(
    ofType<LeaveFromTournament>(TournamentActionTypes.LeaveFromTournament),
    map((action) => action.payload.id),
    switchMap((id) => this.tournamentResource.leaveToTournament(id).pipe(
      switchMap((tournamentId) => [
        new GetTournament({ id: tournamentId, resourcetype: TournamentResourceType.OnlineTournament }),
      ]),
    )
    )
  );

  @Effect()
  getFideTournamentResults$: Observable<Action> = this.actions$.pipe(
    ofType<GetFideTournamentResults>(TournamentActionTypes.GetFideTournamentResults),
    switchMap((action) => this.tournamentResource.getFideTournamentResults(action.payload.id).pipe(
      map(results => new LoadTournamentResults({ results }))
    ))
  );

  @Effect()
  getFounderTournamentResults$: Observable<Action> = this.actions$.pipe(
    ofType<GetFounderTournamentResults>(TournamentActionTypes.GetFounderTournamentResults),
    switchMap((action) => this.tournamentResource.getFounderTournamentResults(action.payload.id).pipe(
      map(results => new LoadTournamentResults({ results }))
    ))
  );

  @Effect()
  addTournamentToWishList$: Observable<Action> = this.actions$.pipe(
    ofType<AddTournamentToWishList>(TournamentActionTypes.AddTournamentToWishList),
    switchMap((action) => this.tournamentResource.addTournamentToWishList(action.payload.tournament).pipe(
      switchMap(() => [new TournamentWishListSuccess(), new GetTournamentWishList()]),
      catchError(() => of(new TournamentWishListError({ message: '1'})))
    ))
  );

  @Effect()
  removeTournamentFromWishList: Observable<Action> = this.actions$.pipe(
    ofType<RemoveTournamentFromWishList>(TournamentActionTypes.RemoveTournamentFromWishList),
    switchMap((action) => {
      return this.store$.pipe(
        select(selectTournamentWishList),
        take(1),
        switchMap((wishList) => {
          const entry = wishList.find(e => e.tournament === action.payload.tournament);
          return !!entry ? this.tournamentResource.removeTournamentFromWishList(entry.id).pipe(
            switchMap(() => [new TournamentWishListSuccess(), new GetTournamentWishList()]),
            catchError(() => of(new TournamentWishListError({ message: '2' })))
          ) : of(new TournamentWishListError({ message: '3' }));
        })
      );
    })
  );

  @Effect()
  getTournamentWishList$: Observable<Action> = this.actions$.pipe(
    ofType<GetTournamentWishList>(TournamentActionTypes.GetTournamentWishList),
    switchMap((action) => this.tournamentResource.getTournamentWishList().pipe(
      switchMap((wishList: any[]) => of(new LoadTournamentWishList({ wishList }))),
      catchError(() => of(new TournamentWishListError({ message: '4'})))
    ))
  );
}
