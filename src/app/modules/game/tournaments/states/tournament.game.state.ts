import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import {
  InitTournamentIds,
  NextTourCreated,
  SetCurrentActiveBoardId,
  SetCurrentTourNumber,
  SetHasNoTour,
  SetHasNoTourNotification,
  SetLastTourFlag,
  SetOpponentHasLeft,
  SetPlayerHasLeft,
  SetTourBoardId,
  SetTourEnd, SetTourJustFinishedFlag,
  SetTournamentInfo,
  SetTournamentOpponentInfo,
  SetTournamentOver,
  SetTournamentPlayerInfo,
  SetTourStarted,
  SetTourSuccessfullyStarted,
  TourReady,
  UpdateTourData,
} from '@app/modules/game/tournaments/states/tournament.actions';

export interface ITournamentGameState {
  currentTour: number;
  isLastTour: boolean;
  tourStarted: boolean;
  tourJustFinished: boolean;
  tourBoardId: string;
  tournamentId: number;
  tournamentName: string;
  tournamentNumberOfTours: number;
  tournamentCurrentTourNumber: number;
  currentActiveBoardId: string;
  nextTourBoardCreated: boolean;
  readyToTourUpdate: boolean;
  nextTourJWT: string;
  nextTourId: string;
  nextTourBoardId: string;
  playerRank: number;
  playerScore: number;
  opponentRank: number;
  opponentScore: number;
  tourSuccessfullyStarted: boolean;
  opponentHasLeft: boolean;
  playerHasLeft: boolean;
  hasNoTourNow: boolean;
  hasNoTourNowNotification: boolean;
  tournamentOver: boolean;
}

const defaultState: ITournamentGameState = {
  tournamentName: null,
  tournamentNumberOfTours: null,
  tournamentCurrentTourNumber: null,
  isLastTour: false,
  tourStarted: false,
  tourJustFinished: false,
  tourSuccessfullyStarted: false,
  tourBoardId: null,
  currentActiveBoardId: window.localStorage.getItem('current-active-board-id'),
  currentTour: +window.localStorage.getItem('current-tour-id'),
  tournamentId: +window.localStorage.getItem('tournament-id'),
  nextTourJWT: window.localStorage.getItem('next-tour-jwt'),
  nextTourBoardId: window.localStorage.getItem('next-tour-board-id'),
  nextTourId: window.localStorage.getItem('next-tour-id'),
  nextTourBoardCreated: (/true/i).test(window.localStorage.getItem('need-tour-update')),
  readyToTourUpdate: false,
  playerRank: 0,
  playerScore: 0,
  opponentRank: 0,
  opponentScore: 0,
  opponentHasLeft: false,
  playerHasLeft: false,
  hasNoTourNow: false,
  hasNoTourNowNotification: false,
  tournamentOver: false
};

@State<ITournamentGameState>({
  name: 'TournamentGameState',
  defaults: defaultState,
})
export class TournamentGameState implements NgxsOnInit {
  constructor() {
  }

  @Selector()
  static hasNoTour(state: ITournamentGameState) {
    return state.hasNoTourNow;
  }

  @Selector()
  static hasNoTourNotification(state: ITournamentGameState) {
    return state.hasNoTourNowNotification;
  }

  @Selector()
  static isTourStarted(state: ITournamentGameState): boolean {
    return state.tourStarted;
  }

  @Selector()
  static isLastTour(state: ITournamentGameState): boolean {
    return state.isLastTour;
  }

  @Selector()
  static tourBoardId(state: ITournamentGameState) {
    return state.tourBoardId;
  }

  @Selector()
  static tournamentName(state: ITournamentGameState) {
    return state.tournamentName;
  }

  @Selector()
  static tournamentNumberOfTours(state: ITournamentGameState) {
    return state.tournamentNumberOfTours;
  }

  @Selector()
  static tournamentCurrentTourNumber(state: ITournamentGameState) {
    return state.tournamentCurrentTourNumber;
  }

  @Selector()
  static nextTourJWT(state: ITournamentGameState) {
    return state.nextTourJWT;
  }

  @Selector()
  static nextTourId(state: ITournamentGameState) {
    return state.nextTourId;
  }

  @Selector()
  static nextTourBoardId(state: ITournamentGameState) {
    return state.nextTourBoardId;
  }

  @Selector()
  static tournamentId(state: ITournamentGameState) {
    return state.tournamentId;
  }

  @Selector()
  static getCurrentTourId(state: ITournamentGameState) {
    return state.currentTour;
  }

  @Selector()
  static nextTourBoardCreated(state: ITournamentGameState) {
    return state.nextTourBoardCreated;
  }

  @Selector()
  static readyToTourUpdate(state: ITournamentGameState) {
    return state.readyToTourUpdate;
  }

  @Selector()
  static getPlayerRank(state: ITournamentGameState) {
    return state.playerRank;
  }

  @Selector()
  static getPlayerScore(state: ITournamentGameState) {
    return state.playerScore;
  }

  @Selector()
  static getOpponentRank(state: ITournamentGameState) {
    return state.opponentRank;
  }

  @Selector()
  static getOpponentScore(state: ITournamentGameState) {
    return state.opponentScore;
  }

  @Selector()
  static opponentHasLeft(state: ITournamentGameState) {
    return state.opponentHasLeft;
  }

  @Selector()
  static playerHasLeft(state: ITournamentGameState) {
    return state.playerHasLeft;
  }

  @Selector()
  static getCurrentActiveBoardId(state: ITournamentGameState) {
    return state.currentActiveBoardId;
  }

  @Selector()
  static tournamentIsOver(state: ITournamentGameState) {
    return state.tournamentOver;
  }

  @Selector()
  static tournamentGameInProgressOrJustFinished(state: ITournamentGameState) {
    return state.tourStarted || state.tourJustFinished;
  }

  @Action(TourReady)
  tourReady(ctx: StateContext<ITournamentGameState>, action: TourReady) {
    if (!action.board) {
      return ctx.patchState({
        tourBoardId: null
      });
    }

    ctx.patchState({
      tourBoardId: action.board.board_id
    });
  }

  @Action(UpdateTourData)
  updateTourData(ctx: StateContext<ITournamentGameState>, action: UpdateTourData) {
    const state = ctx.getState();
    if (state.nextTourBoardCreated) {
      ctx.patchState({
        currentTour: +state.nextTourId,
        tourBoardId: state.nextTourBoardId,
        nextTourJWT: null,
        nextTourId: null,
        nextTourBoardId: null,
        nextTourBoardCreated: false
      });

      const nextTourId = window.localStorage.getItem('next-tour-id');

      window.localStorage.removeItem('current-tour-id');

      if (nextTourId) {
        window.localStorage.setItem('current-tour-id', nextTourId);
      }
      window.localStorage.removeItem('next-tour-JWT');
      window.localStorage.removeItem('need-tour-update');
      window.localStorage.removeItem('next-tour-id');
      window.localStorage.removeItem('next-tour-board-id');
    }
  }

  @Action(InitTournamentIds)
  initTournamentIds(ctx: StateContext<ITournamentGameState>, action: InitTournamentIds) {
    window.localStorage.removeItem('next-tour-JWT');
    window.localStorage.removeItem('need-tour-update');
    window.localStorage.removeItem('next-tour-id');
    window.localStorage.removeItem('next-tour-board-id');
    window.localStorage.setItem('current-tour-id', action.tourId.toString());
    window.localStorage.setItem('tournament-id', action.tournamentId.toString());
    ctx.patchState({
      currentTour: action.tourId,
      tournamentId: action.tournamentId,
      tourStarted: false,
      tourSuccessfullyStarted: false,
      nextTourJWT: null,
      nextTourId: null,
      nextTourBoardId: null,
      nextTourBoardCreated: false,
      tournamentOver: false
    });
  }

  @Action(SetTournamentInfo)
  setTournamentInfo(ctx: StateContext<ITournamentGameState>, action: SetTournamentInfo) {
    ctx.patchState({
      tournamentName: action.tournamentName,
      tournamentNumberOfTours: action.tournamentNumberOfRound
    });
  }

  @Action(SetLastTourFlag)
  setLastTourFlag(ctx: StateContext<ITournamentGameState>, action: SetLastTourFlag) {
    ctx.patchState({
      isLastTour: action.isLastTour
    });
  }

  @Action(SetCurrentTourNumber)
  setCurrentTourNumber(ctx: StateContext<ITournamentGameState>, action: SetCurrentTourNumber) {
    ctx.patchState({
      tournamentCurrentTourNumber: action.numberOfTour
    });
  }

  @Action(NextTourCreated)
  nextTourCreated(ctx: StateContext<ITournamentGameState>, action: NextTourCreated) {
    window.localStorage.setItem('next-tour-jwt', action.jwt);
    window.localStorage.setItem('next-tour-board-id', action.boardId);
    window.localStorage.setItem('next-tour-id', action.tourId);
    window.localStorage.setItem('need-tour-update', 'true');
    ctx.patchState({
      tournamentId: action.tournamentId,
      nextTourJWT: action.jwt,
      nextTourBoardId: action.boardId,
      nextTourId: action.tourId,
      nextTourBoardCreated: true,
      readyToTourUpdate: true
    });
  }


  @Action(SetTourStarted)
  setTourStarted(ctx: StateContext<ITournamentGameState>, action: SetTourStarted) {
    ctx.patchState({
      tourStarted: true,
      tourJustFinished: false
    });
  }

  @Action(SetTourEnd)
  setTourEnd(ctx: StateContext<ITournamentGameState>, action: SetTourEnd) {
    ctx.patchState({
      tourStarted: false,
      tourJustFinished: true,
      tourSuccessfullyStarted: false,
      currentActiveBoardId: null
    });
    window.localStorage.removeItem('current-active-board-id');
  }

  @Action(SetTourJustFinishedFlag)
  setTourJustFinishedFlag(ctx: StateContext<ITournamentGameState>, action: SetTourJustFinishedFlag) {
    ctx.patchState({
      tourJustFinished: action.tourJustFinished
    });
  }

  @Action(SetTournamentPlayerInfo)
  setTournamentPlayerInfo(ctx: StateContext<ITournamentGameState>, action: SetTournamentPlayerInfo) {
    ctx.patchState({
      playerRank: action.rank,
      playerScore: action.score
    });
  }

  @Action(SetTourSuccessfullyStarted)
  setTourSuccessfullyStarted(ctx: StateContext<ITournamentGameState>, action: SetTourSuccessfullyStarted) {
    ctx.patchState({
      tourSuccessfullyStarted: true
    });
  }

  @Action(SetTournamentOpponentInfo)
  setTournamentOpponentInfo(ctx: StateContext<ITournamentGameState>, action: SetTournamentOpponentInfo) {
    ctx.patchState({
      opponentRank: action.rank,
      opponentScore: action.score
    });
  }

  @Action(SetTourBoardId)
  setTourBoardId(ctx: StateContext<ITournamentGameState>, action: SetTourBoardId) {
    ctx.patchState({
      tourBoardId: action.boardId
    });
  }

  @Action(SetOpponentHasLeft)
  setOpponentHasLeft(ctx: StateContext<ITournamentGameState>, action: SetOpponentHasLeft) {
    ctx.patchState({
      opponentHasLeft: action.flag
    });
  }

  @Action(SetPlayerHasLeft)
  setPlayerHasLeft(ctx: StateContext<ITournamentGameState>, action: SetPlayerHasLeft) {
    ctx.patchState({
      playerHasLeft: action.flag
    });
  }

  @Action(SetHasNoTour)
  setHasNoTourNow(ctx: StateContext<ITournamentGameState>, action: SetHasNoTour) {
    ctx.patchState({
      hasNoTourNow: action.flag,
      hasNoTourNowNotification: action.flag
    });
  }

  @Action(SetHasNoTourNotification)
  setHasNoTourNowNotification(ctx: StateContext<ITournamentGameState>, action: SetHasNoTourNotification) {
    ctx.patchState({
      hasNoTourNowNotification: action.flag
    });
  }

  @Action(SetCurrentActiveBoardId)
  setCurrentActiveBoardId(ctx: StateContext<ITournamentGameState>, action: SetCurrentActiveBoardId) {
    window.localStorage.setItem('current-active-board-id', action.boardId);
    ctx.patchState({
      currentActiveBoardId: action.boardId
    });
  }

  @Action(SetTournamentOver)
  setTournamentOver(ctx: StateContext<ITournamentGameState>, action: SetTournamentOver) {
    ctx.patchState({
      tournamentOver: action.flag
    });
  }

  ngxsOnInit(ctx?: StateContext<ITournamentGameState>): void | any {
    return;
  }
}
