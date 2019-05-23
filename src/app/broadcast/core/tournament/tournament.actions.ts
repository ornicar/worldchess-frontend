import { Update } from '@ngrx/entity';
import { Action } from '@ngrx/store';
import { IDefaultEntities } from '../models/default-entities';
import { OnlineTournament, FounderTournament, Tournament, TournamentWishListEntry, IGetTournamentsOptions, CommonTournament } from './tournament.model';
import { IMyTournamentErrors } from './tournament.reducer';
import { IResultsLists } from '../result/result.model';

export enum TournamentActionTypes {
  SetSelectedTournament = '[Tournament] Set selected Tournament',
  ClearSelectedTournament = '[Tournament] Clear selected Tournament',
  GetTournament = '[Tournament] Get Tournament',
  GetTournaments = '[Tournament] Get Tournaments',
  AddTournamentDefaultEntities = '[Tournament] Add default entities for tournament',
  LoadTournaments = '[Tournament] Load Tournaments',
  AddTournament = '[Tournament] Add Tournament',
  // UpsertTournament = '[Tournament] Upsert Tournament',
  AddTournaments = '[Tournament] Add Tournaments',
  // UpsertTournaments = '[Tournament] Upsert Tournaments',
  UpdateTournament = '[Tournament] Update Tournament',
  UpdateTournaments = '[Tournament] Update Tournaments',
  DeleteTournament = '[Tournament] Delete Tournament',
  DeleteTournaments = '[Tournament] Delete Tournaments',
  ClearTournaments = '[Tournament] Clear Tournaments',
  GetFideTournamentResults = '[Tournament] Get FIDE Tournament results',
  GetFounderTournamentResults = '[Tournament] Get Founder Tournament results',
  LoadTournamentResults = '[Tournament] Load Tournament results',

  // My tournaments
  GetMyTournaments = '[Tournament] Get My Tournaments',
  CreateMyTournament = '[Tournament] Create My Tournament',
  PatchMyTournament = '[Tournament] Patch My Tournament',
  PatchMyTournamentAndNavigate = '[Tournament] Patch My Tournament And Navigate',
  DeleteMyTournament = '[Tournament] Delete My Tournament',
  SendToApproveMyTournament = '[Tournament] Send To Approve My Tournament',
  SetMyTournamentErrors = '[Tournament] Set My Tournament Errors',
  ClearMyTournamentErrors = '[Tournament] Clear My Tournament Errors',
  UpdateOnlineTournaments = '[Tournament] update online tournament',
  SignupToTournament = '[Tournament] Signup to tournament',
  SignupToTournamentSuccess = '[Tournament] Success signup to tournament',
  SignupToTournamentError = '[Tournament] Error has occurred on signup to tournament',
  SignupToTournamentErrorClear = '[Tournament] Clear error message that has occurred on signup to tournament',
  ClearSignedTournament = '[Tournament] Clear signed tournament',
  TournamentWishListSuccess = '[Tournament] Tournament wish list success',
  TournamentWishListError = '[Tournament] Tournament wish list error',
  AddTournamentToWishList = '[Tournament] Add tournament to wish list',
  RemoveTournamentFromWishList = '[Tournament] Remove tournament from wish list',
  GetTournamentWishList = '[Tournament] Get tournament wish list',
  LoadTournamentWishList = '[Tournament] Load tournament wish list',
}

export class SetSelectedTournament implements Action {
  readonly type = TournamentActionTypes.SetSelectedTournament;

  constructor(public payload: { id: number }) {}
}

export class ClearSelectedTournament implements Action {
  readonly type = TournamentActionTypes.ClearSelectedTournament;

  constructor() {}
}

export class LoadTournaments implements Action {
  readonly type = TournamentActionTypes.LoadTournaments;

  constructor(public payload: { tournaments: CommonTournament[] }) {}
}

export class GetTournament implements Action {
  readonly type = TournamentActionTypes.GetTournament;

  constructor(public payload: { id: number }) {}
}

export class GetTournaments implements Action {
  readonly type = TournamentActionTypes.GetTournaments;

  constructor(public payload: { options?: IGetTournamentsOptions }) {}
}

export class AddTournamentDefaultEntities implements Action {
  readonly type = TournamentActionTypes.AddTournamentDefaultEntities;

  constructor(public payload: { id: number, defaults: IDefaultEntities }) {}
}

export class AddTournament implements Action {
  readonly type = TournamentActionTypes.AddTournament;

  constructor(public payload: { tournament: CommonTournament }) {}
}

export class AddTournaments implements Action {
  readonly type = TournamentActionTypes.AddTournaments;

  constructor(public payload: { tournaments: CommonTournament[] }) {}
}

export class UpdateTournament implements Action {
  readonly type = TournamentActionTypes.UpdateTournament;

  constructor(public payload: { tournament: Update<CommonTournament> }) {}
}

export class UpdateTournaments implements Action {
  readonly type = TournamentActionTypes.UpdateTournaments;

  constructor(public payload: { tournaments: Update<CommonTournament>[] }) {}
}

export class DeleteTournament implements Action {
  readonly type = TournamentActionTypes.DeleteTournament;

  constructor(public payload: { id: number }) {}
}

export class DeleteTournaments implements Action {
  readonly type = TournamentActionTypes.DeleteTournaments;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearTournaments implements Action {
  readonly type = TournamentActionTypes.ClearTournaments;
}

//
// My tournaments
//
export class GetMyTournaments implements Action {
  readonly type = TournamentActionTypes.GetMyTournaments;
}

export class CreateMyTournament implements Action {
  readonly type = TournamentActionTypes.CreateMyTournament;

  constructor(public payload: { tournament: Partial<FounderTournament> }) {}
}

export class PatchMyTournament implements Action {
  readonly type = TournamentActionTypes.PatchMyTournament;

  constructor(public payload: { changes: Partial<FounderTournament>, id: number}) { }
}
export class PatchMyTournamentAndNavigate implements Action {
  readonly type = TournamentActionTypes.PatchMyTournamentAndNavigate;

  constructor(public payload: { changes: Partial<FounderTournament>, id: number, route: string}) {}
}

export class DeleteMyTournament implements Action {
  readonly type = TournamentActionTypes.DeleteMyTournament;

  constructor(public payload: { id: number }) {}
}

export class SendToApproveMyTournament implements Action {
  readonly type = TournamentActionTypes.SendToApproveMyTournament;

  constructor(public payload: { id: number }) {}
}

export class SetMyTournamentErrors implements Action {
  readonly type = TournamentActionTypes.SetMyTournamentErrors;

  constructor(public payload: { errors: IMyTournamentErrors }) {}
}

export class ClearMyTournamentErrors implements Action {
  readonly type = TournamentActionTypes.ClearMyTournamentErrors;

  constructor() {}
}

export class GetFideTournamentResults implements Action {
  readonly type = TournamentActionTypes.GetFideTournamentResults;

  constructor(public payload: { id: number }) {}
}

export class GetFounderTournamentResults implements Action {
  readonly type = TournamentActionTypes.GetFounderTournamentResults;

  constructor(public payload: { id: number }) {}
}

export class LoadTournamentResults implements Action {
  readonly type = TournamentActionTypes.LoadTournamentResults;

  constructor(public payload: { results: IResultsLists }) {}
}

export class UpdateOnlineTournaments implements Action {
  readonly type = TournamentActionTypes.UpdateOnlineTournaments;
}

export class SignupToTournament implements Action {
  readonly type = TournamentActionTypes.SignupToTournament;

  constructor(public payload: { id: number }) {}
}

export class SignupToTournamentSuccess implements Action {
  readonly type = TournamentActionTypes.SignupToTournamentSuccess;

  constructor(public payload: { tournament: OnlineTournament }) {}
}

export class SignupToTournamentError implements Action {
  readonly type = TournamentActionTypes.SignupToTournamentError;

  constructor(public payload: { message: string }) {}
}

export class ClearSignedTournament implements Action {
  readonly type = TournamentActionTypes.ClearSignedTournament;
}

export class SignupToTournamentErrorClear implements Action {
  readonly type = TournamentActionTypes.SignupToTournamentErrorClear;
}

export class TournamentWishListSuccess implements Action {
  readonly type = TournamentActionTypes.TournamentWishListSuccess;
}

export class TournamentWishListError implements Action {
  readonly type = TournamentActionTypes.TournamentWishListError;

  constructor(public payload: { message: string }) {}
}

export class AddTournamentToWishList implements Action {
  readonly type = TournamentActionTypes.AddTournamentToWishList;

  constructor(public payload: { tournament: number }) {}
}

export class RemoveTournamentFromWishList implements Action {
  readonly type = TournamentActionTypes.RemoveTournamentFromWishList;

  constructor(public payload: { tournament: number }) {}
}

export class GetTournamentWishList implements Action {
  readonly type = TournamentActionTypes.GetTournamentWishList;
}

export class LoadTournamentWishList implements Action {
  readonly type = TournamentActionTypes.LoadTournamentWishList;

  constructor(public payload: { wishList: TournamentWishListEntry[] }) {}
}

export type TournamentActions =
  SetSelectedTournament
 | ClearSelectedTournament
 | GetTournament
 | GetTournaments
 | AddTournamentDefaultEntities
 | LoadTournaments
 | AddTournament
 | AddTournaments
 | UpdateTournament
 | UpdateTournaments
 | DeleteTournament
 | DeleteTournaments
 | ClearTournaments
 | GetMyTournaments
 | CreateMyTournament
 | PatchMyTournament
 | PatchMyTournamentAndNavigate
 | DeleteMyTournament
 | SendToApproveMyTournament
 | SetMyTournamentErrors
 | ClearMyTournamentErrors
 | GetFideTournamentResults
 | LoadTournamentResults
 | SignupToTournament
 | SignupToTournamentSuccess
 | SignupToTournamentError
 | ClearSignedTournament
 | SignupToTournamentErrorClear
 | UpdateOnlineTournaments
 | TournamentWishListSuccess
 | TournamentWishListError
 | AddTournamentToWishList
 | RemoveTournamentFromWishList
 | GetTournamentWishList
 | LoadTournamentWishList;
