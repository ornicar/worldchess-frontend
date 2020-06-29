import { IOnlineTournamentStandings, IOnlineTournamentState } from './../models/tournament.model';
import { IGameBoard } from '@app/modules/game/state/game-board.model';
import { ActionSource } from '@app/modules/game/state/action-source.enum';
import { IOnlineTournament, IOnlineTournamentBoard } from '@app/modules/game/tournaments/models/tournament.model';
import { ITour } from '@app/broadcast/core/tour/tour.model';

export class SubscribeToBoardsByBoardID {
  static readonly type = '[TournamentState] Subscribe to boards by boardIds';
  constructor(public boardId: string, public token?: string) {}
}

export class SubscribeViewerByBoardID {
  static readonly type = '[TournamentState] Subscribe to boards by viewer';
  constructor(public boardId: string) {}
}

export class UnsubscribeViewerByBoardID {
  static readonly type = '[TournamentState] Unsubscribe to boards by viewer';
  constructor(public boardId: string) {}
}

export class UnsubscribeToBoardsByBoardID {
  static readonly type = '[TournamentState] Unsubscribe to boards by boardIds';
  constructor(public boardId: string) {}
}

export class SetCurrentTourID {
  static readonly type = '[TournamentState] Set current to tour ID';
  constructor(public currentTourID: number) {}
}

export class SetReadyToTourUpdate {
  static readonly type = '[TournamentState] Set ready tour update flag';
  constructor(public flag: boolean) {}
}

export class TourReady {
  static readonly type = '[TournamentState] Set tour ready info';
  constructor(public board: IGameBoard) {}
}

export class SubscribeToTourBoard {
  static readonly type = '[TournamentState] Subscribe to tournament board';
  constructor(public jwt?: string) {}
}

export class SetTourEnd {
  static readonly type = '[TournamentState] Set tour end fields';
  constructor() {}
}

export class NextTourCreated {
  static readonly type = '[TournamentSate] Next tour created';
  constructor(
    public boardId: string,
    public jwt?: string,
    public tourId?: string,
    public tournamentId?: number,
    public source: ActionSource = ActionSource.WEBSOCKET
  ) {}
}

export class SetCurrentTourNumber {
  static readonly type = '[TournamentSate] Set currentTourNumber';
  constructor(public numberOfTour: number, public source: ActionSource = ActionSource.WEBSOCKET) {}
}

export class SetLastTourFlag {
  static readonly type = '[TournamentSate] Set last tour flag';
  constructor(public isLastTour: boolean, public source: ActionSource = ActionSource.WEBSOCKET) {}
}

export class UpdateTourData {
  static readonly type = '[TournamentState] Update tour data';
  constructor() {}
}

export class InitTournamentIds {
  static readonly type = '[TournamentState] Init tournament ids';
  constructor(public tourId: number, public tournamentId: number) {}
}

export class SetTournamentInfo {
  static readonly type = '[TournamentState] Set tournament info';
  constructor(public tournamentName: string, public tournamentNumberOfRound: number) {}
}

export class SetTourStarted {
  static readonly type = '[TournamentState] Set tour started';
  constructor() {}
}

export class SetTourJustFinishedFlag {
  static readonly type = '[TournamentState] Set flag of just finished tour';
  constructor(public tourJustFinished: boolean) {}
}

export class SetTournamentPlayerInfo {
  static readonly type = '[TournamentState] Set tournament player info';

  constructor(public rank: number, public score: number) {}
}

export class SetTournamentOpponentInfo {
  static readonly type = '[TournamentState] Set tournament opponent info';
  constructor(public rank: number, public score: number) {}
}

export class SetTourBoardId {
  static readonly type = '[TournamentState] Set tour board id';
  constructor(public boardId: string) {}
}

export class SetOpponentHasLeft {
  static readonly type = '[TournamentState] Set opponent has left flag';
  constructor(public flag: boolean) {}
}

export class SetPlayerHasLeft {
  static readonly type = '[TournamentState] Set player has left flag';
  constructor(public flag: boolean) {}
}

export class SetTourSuccessfullyStarted {
  static readonly type = '[TournamentState] Set tour successfully started';
  constructor() {}
}
export class SetOnlineTournament {
  static readonly type = '[TournamentState] set online tournament';
  constructor(public tournament: IOnlineTournament) {}
}

export class SetHasNoTour {
  static readonly type = '[TournamentState] set has no tour';
  constructor(public flag: boolean) {}
}

export class SetHasNoTourNotification {
  static readonly type = '[TournamentState] set has no tour notification';
  constructor(public flag: boolean) {}
}

export class SetCurrentActiveBoardId {
  static readonly type = '[TournamentState] set current active board id';
  constructor(public boardId: string) {}
}

export class UpdateOnlineTournament {
  static readonly type = '[TournamentState] update online tournament';
  constructor(public tournament: IOnlineTournament) {}
}

export class SetBoardsTournament {
  static readonly type = '[TournamentState] set online boards';
  constructor(public boards: IOnlineTournamentBoard[]) {}
}

export class UpdateBoardsTournament {
  static readonly type = '[TournamentState] update online boards';
  constructor(public boards: IOnlineTournamentBoard[]) {}
}

export class SetToursTournament {
  static readonly type = '[TournamentState] set tours';
  constructor(public tours: ITour[]) {}
}

export class UpdateToursTournament {
  static readonly type = '[TournamentState] update tours';
  constructor(public tours: ITour[]) {}
}

export class SetTournamentOver {
  static readonly type = '[TournamentState] set tournament over flag';
  constructor(public flag: boolean) {}
}

export class SetStandings {
  static readonly type = '[TournamentState] set standings';
  constructor(public standings: IOnlineTournamentStandings[]) {}
}

export class UpdateStandings {
  static readonly type = '[TournamentState] update standings';
  constructor(public standings: IOnlineTournamentStandings[]) {}
}

export class UpdateTournamentState {
  static readonly type = '[TournamentState] update tournament state';
  constructor(public changeState: IOnlineTournamentState) {}
}

export class UpdateUserSigned {
  static readonly type = '[TournamentState] signup to tournament';
  constructor(public userSigned: boolean) {}
}
