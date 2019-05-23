import { State, Action, StateContext, Selector } from '@ngxs/store';
import { IGameBoard } from './game-board.model';
import {
  AddNewMove,
  AddGameBoard,
  SetPlayerColor,
  RequestOpponent,
  RejectOpponentRequest,
  SubscribeToBoard,
  GameReady,
  SelectMove,
  SetPlayer,
  SetOpponent,
  RestartGame,
  ShowGameResult,
  SetGameResult,
  Resign,
  Draw,
  SetNotification,
  SetRatingChange,
  OpponentOfferADraw,
  SetAccount,
  SocketMessage,
  SetPgnUrl,
  SendBugReport,
  GetTimeControls,
  SetSelectedTimeControl,
  SetTimeControls,
  CallAnArbiter,
  AbortGame,
} from './game.actions';
import { ActionSource } from './action-source.enum';
import { GameResourceService } from './game.resouce.service';
import { ChessColors } from '../chess-board/chess-board.component';
import { IGameMove } from './game-move.model';
import { IPlayer } from '../../../app/broadcast/core/player/player.model';
import { Result } from '../../../app/broadcast/core/result/result.model';
import { EndReason, GameResult } from './game-result-enum';
import { IAccount } from '../../account/account-store/account.model';
import { IGameSocketMessagesHistory } from './game-socket-messages-history.model';
import { ITimeControl } from '@app/broadcast/core/tour/tour.model';
import * as moment from 'moment';

export interface IGameState {
  waitingOpponent: boolean;
  requestOpponentUID: string;
  rating: number;
  board: IGameBoard;
  gameReady: boolean;
  playerColor: ChessColors;
  selectedMove: IGameMove;
  player: IPlayer;
  opponent: IPlayer;
  isResultShown: boolean;
  gameResult: GameResult;
  endReason: EndReason;
  notification: string;
  playerTimer: number;
  opponentTimer: number;
  ratingChange: number;
  opponentOfferedDraw: boolean;
  account: IAccount;
  socketMessages: IGameSocketMessagesHistory[];
  pgnUrl: string;
  timeControls: ITimeControl[];
  selectedTimeControl: ITimeControl;
  canCallAnArbiter: boolean;
}

const defaultState: IGameState = {
    waitingOpponent: false,
    requestOpponentUID: null,
    rating: null,
    board: null,
    gameReady: false, // debug
    playerColor: ChessColors.White,
    selectedMove: null,
    player: null,
    opponent: null,
    isResultShown: false,
    gameResult: null,
    endReason: null,
    notification: null,
    playerTimer: 180,
    opponentTimer: 180,
    ratingChange: null,
    opponentOfferedDraw: false,
    account: null,
    socketMessages: [],
    pgnUrl: null,
    timeControls: [],
    selectedTimeControl: null,
    canCallAnArbiter: true,
};

@State<IGameState>({
  name: 'GameState',
  defaults: defaultState,
})
export class GameState {
  @Selector()
  static board(state: IGameState) {
    return state.board;
  }

  @Selector()
  static moves(state: IGameState) {
    if (state.board) {
      return state.board.moves;
    }
  }

  @Selector()
  static lastMove(state: IGameState) {
    if (state.board) {
      return state.board.moves.slice(-1).pop();
    }
  }

  @Selector()
  static playerColor(state: IGameState) {
    return state.playerColor;
  }

  @Selector()
  static isMyMove(state: IGameState): boolean {
    if (!state.board || !state.gameReady || state.gameResult) {
      return false;
    }

    if (state.playerColor === ChessColors.White && state.board.moves.length === 0) {
      return true;
    }

    if (state.board.moves.length === 0) {
      return false;
    }

    const lastMove = state.board.moves.slice(-1).pop();
    if (state.playerColor === ChessColors.White && !lastMove.is_white_move) {
      return true;
    }

    if (state.playerColor === ChessColors.Black && lastMove.is_white_move) {
      return true;
    }

    return false;
  }

  @Selector()
  static waitingOpponent(state: IGameState): boolean {
    return state.waitingOpponent;
  }

  @Selector()
  static gameReady(state: IGameState): boolean {
    return state.gameReady;
  }

  @Selector()
  static selectedMove(state: IGameState): IGameMove {
    return state.selectedMove;
  }

  @Selector()
  static player(state: IGameState): IPlayer {
    if (state.account && !state.player) {
      return {
        full_name: state.account.full_name,
        nickname: state.account.nickname,
        avatar: {
          full: state.account.avatar['full'],
        },
        rating: state.rating,
        fide_id: null,
        federation: null,
      } as IPlayer;
    }
    return state.player;
  }

  @Selector()
  static opponent(state: IGameState): IPlayer {
    return state.opponent;
  }

  @Selector()
  static isResultShown(state: IGameState): boolean {
    return state.isResultShown;
  }

  @Selector()
  static gameResult(state: IGameState): GameResult {
    return state.gameResult;
  }

  @Selector()
  static endReason(state: IGameState): EndReason {
    return state.endReason;
  }

  @Selector()
  static notification(state: IGameState): string {
    return state.notification;
  }

  @Selector()
  static opponentOfferedDraw(state: IGameState): boolean {
    return state.opponentOfferedDraw;
  }

  @Selector()
  static playerTimer(state: IGameState): number {
    if (state.endReason === EndReason.TIME_CONTROL && state.gameResult === GameResult.LOST) {
      return 0;
    }

    return state.playerTimer;
  }

  @Selector()
  static opponentTimer(state: IGameState): number {
    if (state.endReason === EndReason.TIME_CONTROL && state.gameResult === GameResult.WON) {
      return 0;
    }

    return state.opponentTimer;
  }

  @Selector()
  static ratingChange(state: IGameState): number {
    return state.ratingChange;
  }

  @Selector()
  static account(state: IGameState): IAccount {
    return state.account;
  }

  @Selector()
  static gameInProgress(state: IGameState): boolean {
    return state.gameReady && !state.gameResult && !state.waitingOpponent;
  }

  @Selector()
  static socketMessages(state: IGameState): any[] {
    return state.socketMessages;
  }

  @Selector()
  static pgnUrl(state: IGameState): string {
    return state.pgnUrl;
  }

  @Selector()
  static timeControls(state: IGameState): ITimeControl[] {
    return state.timeControls;
  }

  @Selector()
  static selectedTimeControl(state: IGameState): ITimeControl {
    return state.selectedTimeControl;
  }

  @Selector()
  static canCallAnArbiter(state: IGameState): boolean {
    return state.canCallAnArbiter && Boolean(state.board);
  }

  constructor(
    private resource: GameResourceService,
  ) { }

  @Action(SocketMessage)
  socketMessage(ctx: StateContext<IGameState>, action: SocketMessage) {
    ctx.patchState({
      socketMessages: ctx.getState().socketMessages.concat({
        type: action.type,
        message: action.message,
        date: action.date,
      })
    });
  }

  @Action(AddNewMove)
  addNewMove(ctx: StateContext<IGameState>, action: AddNewMove) {
    const state = ctx.getState();

    ctx.patchState({
      board: {
        ...state.board,
        moves: [
          ...state.board.moves.filter(move => !(
            move.is_white_move === action.move.is_white_move &&
            move.san === action.move.san &&
            move.move_number === action.move.move_number
          )),
          action.move,
        ]
      },
      notification: GameState.isMyMove(state) ? 'Opponent move!' : 'Your move!',
    });

    switch (action.source) {
      case ActionSource.WEBSOCKET:
        if (
          (state.playerColor === ChessColors.White && action.move.is_white_move) ||
          (state.playerColor === ChessColors.Black && !action.move.is_white_move)
        ) {
          ctx.patchState({
            playerTimer: action.move.seconds_left,
          });
        } else {
          ctx.patchState({
            opponentTimer: action.move.seconds_left,
          });
        }

        break;

      case ActionSource.USER:
        this.resource.addNewMove(state.board.id, action.move);
        break;
    }
  }

  @Action(AddGameBoard)
  addGameBoard(ctx: StateContext<IGameState>, action: AddGameBoard) {
    ctx.patchState({
      board: action.board,
    });
  }

  @Action(SetPlayerColor)
  setPlayerColor(ctx: StateContext<IGameState>, action: SetPlayerColor) {
    ctx.patchState({
      playerColor: action.color,
    });
  }

  @Action(RequestOpponent)
  requestOpponent(ctx: StateContext<IGameState>, action: RequestOpponent) {
    const state = ctx.getState();
    const timeControlId = state.selectedTimeControl && state.selectedTimeControl.id;

    ctx.patchState({
      waitingOpponent: true,
      gameReady: false,
    });
    this.resource.requestOpponent(timeControlId).subscribe(response => {
      ctx.patchState({
        requestOpponentUID: response.uid,
        rating: response.rating,
      });
    });
  }

  @Action(RejectOpponentRequest)
  rejectOpponentRequest(ctx: StateContext<IGameState>, action: RejectOpponentRequest) {
    const state = ctx.getState();

    ctx.patchState({
      waitingOpponent: false,
    });

    this.resource.rejectOpponentRequest(state.requestOpponentUID).subscribe();
  }

  @Action(Resign)
  callToResign(ctx: StateContext<IGameState>, action: Resign) {
    const state = ctx.getState();
    this.resource.callToResign(state.board.id);
  }

  @Action(Draw)
  callToDraw(ctx: StateContext<IGameState>, action: Draw) {
    const state = ctx.getState();
    this.resource.callToDraw(state.board.id);
  }

  @Action(OpponentOfferADraw)
  opponentOfferADraw(ctx: StateContext<IGameState>, action: OpponentOfferADraw) {
    ctx.patchState({
      opponentOfferedDraw: action.offer,
    });
  }

  @Action(SubscribeToBoard)
  subscribeToBoard(ctx: StateContext<IGameState>, action: SubscribeToBoard) {
    const state = ctx.getState();

    this.resource.subscribeToBoard(state.board.id, state.board.jwt);
  }

  @Action(GameReady)
  gameReady(ctx: StateContext<IGameState>, action: GameReady) {
    ctx.patchState({
      gameReady: true,
    });
    this.resource.startPing();
  }

  @Action(SelectMove)
  selectMove(ctx: StateContext<IGameState>, action: SelectMove) {
    ctx.patchState({
      selectedMove: action.move,
    });
  }

  @Action(SetPlayer)
  setPlayer(ctx: StateContext<IGameState>, action: SetPlayer) {
    ctx.patchState({
      player: action.player,
    });
  }

  @Action(SetOpponent)
  setOpponent(ctx: StateContext<IGameState>, action: SetOpponent) {
    ctx.patchState({
      opponent: action.opponent,
      waitingOpponent: false,
    });
  }

  @Action(RestartGame)
  restartGame(ctx: StateContext<IGameState>, action: RestartGame) {
    const state = ctx.getState();
    ctx.setState({
      ... defaultState,
      // player: state.player,
      account: state.account,
      timeControls: state.timeControls,
    });

    ctx.dispatch(new SetSelectedTimeControl(state.selectedTimeControl));
  }

  @Action(ShowGameResult)
  showGameResult(ctx: StateContext<IGameState>, action: ShowGameResult) {
    ctx.patchState({
      isResultShown: action.show,
    });
  }

  @Action(SetGameResult)
  setGameResult(ctx: StateContext<IGameState>, action: SetGameResult) {
    const state = ctx.getState();

    if (action.result === Result.WHITE_WIN) {
      ctx.patchState({
        gameResult: state.playerColor === ChessColors.White ? GameResult.WON : GameResult.LOST
      });
    }

    if (action.result === Result.BLACK_WIN) {
      ctx.patchState({
        gameResult: state.playerColor === ChessColors.Black ? GameResult.WON : GameResult.LOST
      });
    }

    if (action.result === Result.DRAW) {
      ctx.patchState({
        gameResult: GameResult.DRAW
      });
    }

    ctx.patchState({
      endReason: action.reason
    });

    this.resource.stopPing();
  }

  @Action(SetNotification)
  setNotification(ctx: StateContext<IGameState>, action: SetNotification) {
    ctx.patchState({
      notification: action.notification
    });
  }

  @Action(SetRatingChange)
  setRatingChange(ctx: StateContext<IGameState>, action: SetRatingChange) {
    const state = ctx.getState();
    let opponent = state.opponent;
    if (opponent) {
      opponent = {
        ... opponent,
        rating: opponent.rating - action.rating,
      };
    }
    let player = state.player;
    if (player) {
      player = {
        ... player,
        rating: player.rating + action.rating,
      };
    }
    ctx.patchState({
      player,
      opponent,
      ratingChange: action.rating,
    });
  }

  @Action(SetAccount)
  setAccount(ctx: StateContext<IGameState>, action: SetAccount) {
    const state = ctx.getState();
    if (state.account && !action.account && state.player) {
      ctx.patchState({
        player: null,
      });
    }

    ctx.patchState({
      account: action.account,
    });
  }

  @Action(SetPgnUrl)
  setPgnUrl(ctx: StateContext<IGameState>, action: SetPgnUrl) {
    const state = ctx.getState();

    if (state.board && state.board.id === action.board_id) {
      ctx.patchState({
        pgnUrl: action.pgnUrl
      });
    }
  }

  @Action(SendBugReport)
  sendBugReport(ctx: StateContext<IGameState>, action: SendBugReport) {
    const state = ctx.getState();

    const user_uid = state.player && state.player.uid;
    const boardId = state.board && state.board.id;
    const log = JSON.stringify({
      socketMessages: state.socketMessages
    });

    this.resource.sendBugReport(user_uid, action.report, boardId, log).subscribe();
  }

  @Action(GetTimeControls)
  getTimeControls(ctx: StateContext<IGameState>, action: GetTimeControls) {
    this.resource.getTimerControls();
  }

  @Action(SetTimeControls)
  setTimeControls(ctx: StateContext<IGameState>, action: SetTimeControls) {
    ctx.patchState({
      timeControls: action.timeControls,
    });
  }

  @Action(SetSelectedTimeControl)
  setSelectedTimeControl(ctx: StateContext<IGameState>, action: SetSelectedTimeControl) {
    if (!action.timeControl) {
      return;
    }

    const timerInSeconds = moment(action.timeControl.start_time, 'HH:mm:ss').minutes() * 60;

    ctx.patchState({
      selectedTimeControl: action.timeControl,
      playerTimer: timerInSeconds,
      opponentTimer: timerInSeconds,
    });
  }

  @Action(CallAnArbiter)
  callAnArbiter(ctx: StateContext<IGameState>, action: CallAnArbiter) {
    const state = ctx.getState();
    this.resource.callAnArbiter(state.board.id, state.player.uid).subscribe();

    ctx.patchState({
      canCallAnArbiter: false
    });
  }

  @Action(AbortGame)
  abortGame(ctx: StateContext<IGameState>, action: AbortGame) {
    const state = ctx.getState();
    this.resource.abortGame(state.board.id, state.player.uid);
  }

}
