import { catchError, distinct, filter, take } from 'rxjs/operators';
import { AccountResourceService } from './../../../account/account-store/account-resource.service';
import { Action, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { IGameBoard } from './game-board.model';
import {
  AbortGame,
  AddGameBoard,
  AddNewMove,
  CallAnArbiter,
  CancelDraw,
  ClearGameResult,
  ClearOnlineRequestStatus,
  DownloadPGN,
  Draw,
  FlipBoard,
  GameBoardCreated,
  GameError,
  GameReady,
  GetOnlineRatings,
  GetTimeControls,
  InitRatingRange,
  InviteCancelRequest,
  OpponentOfferADraw,
  RejectOpponentRequest,
  RejectOpponentRequestLast,
  RequestInvite,
  RequestOpponent,
  ResetQuickstartFlag,
  ResetRematch,
  Resign,
  RestartGame,
  SelectMove,
  SendBugReport,
  SetAccount,
  SetAccountRating,
  SetBoardSubscribed,
  SetBugReportModalOpened,
  SetCancelInvite,
  SetCapturedByBlack,
  SetCapturedByWhite,
  SetChatId,
  SetCheck,
  SetCheckmate,
  SetCheckmateReview,
  SetConnectionActive,
  SetDefaultNewMessage,
  SetFlagRematch,
  SetFlagReplay,
  SetForce,
  SetGameMenuVisible,
  SetGameReady,
  SetGameResult,
  SetGameSettings,
  SetInviteCode,
  SetLeftExpandingRatingRange,
  SetNewMessage,
  SetNotification,
  SetOnlineRatings,
  SetOpponentMode,
  SetOpponentTimer,
  SetPgnUrl,
  SetPlayer,
  SetPlayerColor,
  SetPlayerTimer,
  SetPromotionPopupVisible,
  SetQuickstartFlag,
  SetRatingChange,
  SetRematchInvite,
  SetReplayNotification,
  SetSelectedRatingMode,
  SetSelectedTimeControl,
  SetSelectedTimeControlRatingMode,
  SetShowChat,
  SetStartOnlineRatingRange,
  SetTimeControls,
  SetTimeLimitNotification,
  SetTimerInitializedInMoves,
  SetWidthOnlineRatingRange,
  ShowGameResult,
  SocketMessage,
  SubscribeToBoard,
  TourBoardReady,
  UpdateFinalTimer,
  UpdateTourJWT
} from './game.actions';
import { ActionSource } from './action-source.enum';
import { GameResourceService } from './game.resouce.service';
import { CheckState, IGameMove } from './game-move.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { Result } from '@app/broadcast/core/result/result.model';
import { EndReason, GameResult } from './game-result-enum';
import { IAccount,
  IAccountGameBoardStyle,
  IAccountGameLastMove,
  IAccountLegalMove,
  IAccountRating,
  ISettingsGameAccount
} from '@app/account/account-store/account.model';
import { IGameSocketMessagesHistory } from './game-socket-messages-history.model';
import { BoardType,
  GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import * as moment from 'moment';
import { select, Store as NgrxStore } from '@ngrx/store';
import { selectUID } from '@app/auth/auth.reducer';
import { CheckmateState, TFigure } from '@app/shared/widgets/chessground/figure.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import * as forRoot from '@app/reducers';
import { AuthGetUid } from '@app/auth/auth.actions';
import { environment } from '../../../../environments/environment';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { OnlineRequestResponseStatus } from '@app/modules/game/state/online-request-response.model';
import * as fromAccount from '@app/account/account-store/account.reducer';
import { of } from 'rxjs';
import { INewMessage, RatingMode, TimeLimitWarningType } from '@app/modules/game/state/game.model';
import { patch } from '@ngxs/store/operators';
import { TranslateService } from '@ngx-translate/core';

export interface IForce {
  whiteForce: number;
  blackForce: number;
}

export enum OpponentMode {
  HUMAN = 'human',
  BOT = 'bot',
  FRIEND = 'friend'
}

export enum PlayerType {
  Anonymous = 'anon',
  WCPlayer = 'player',
  FidePlayer = 'fide',
}

export enum StartType {
  Quickstart = 'quickstart',
  Computer = 'computer',
  CreateAccount = 'create_account',
  InviteFriend = 'invite_friend'
}

export interface IGameState {
  waitingOpponent: boolean;
  requestOpponentUID: string;
  rating: number;
  boardId: string;
  error: string;
  jwt: string;
  uid: string;
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
  letsPlayNotification: boolean;
  playerTimer: number;
  opponentTimer: number;
  ratingChange: number;
  opponentOfferedDraw: boolean;
  playerOfferedDraw: boolean;
  playerReadyToOfferDraw: boolean;
  account: IAccount;
  accountRating: IAccountRating;
  socketMessages: IGameSocketMessagesHistory[];
  pgnUrl: string;
  lastRequestOpponentUID: string;
  pgnName: string;
  timeControls: ITimeControl[];
  selectedTimeControl: ITimeControl;
  canCallAnArbiter: boolean;
  gameRatingMode: GameRatingMode;
  capturedByBlack: TFigure[];
  capturedByWhite: TFigure[];
  isCheck: boolean;
  checkmateState: CheckmateState;
  checkmateStateReview: CheckmateState;
  force: IForce;
  opponentMode: OpponentMode;
  lastOpponentMode: OpponentMode;
  promotionPopupVisible: boolean;
  gameMenuVisible: boolean;
  playerTimeLimitNotification: TimeLimitWarningType;
  opponentTimeLimitNotification: TimeLimitWarningType;
  boardIsFlipped: boolean;
  bugReportModalOpened: boolean;
  onlineRatings: IOnlineRating[];
  startIndexOnlineRatingRange: number;
  widthOnlineRatingRange: number;
  onlineRequestFailed: boolean;
  finalTimerUpdated: boolean;
  gameSettings?: ISettingsGameAccount;
  inviteCode: string;
  isCancel: boolean;
  replayNotification: string;
  isReplay: boolean;
  isRematch: boolean; // TODO: нужно подумать куда убрать большое количество флагов...
  rematchInvite: string;
  chatId: string;
  rematchNotification: string;
  opponentUID: string;
  lastChatId: string;
  showChat: boolean;
  newMessage: INewMessage;
  timerInitializedInMoves: boolean;
  quickstart: StartType;
  boardSubscribed: boolean;
  connectionActive: boolean; // флаг активности сокета
  lastConnectActive: boolean; // last connect active
}

const defaultState: IGameState = {
    waitingOpponent: false,
    requestOpponentUID: null,
    rating: null,
    boardId: null,
    error: null,
    jwt: window.localStorage.getItem('gaming-jwt'),
    uid: null,
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
    letsPlayNotification: null,
    playerTimer: 0,
    opponentTimer: 0,
    ratingChange: null,
    opponentOfferedDraw: false,
    playerOfferedDraw: false,
    playerReadyToOfferDraw: false,
    account: null,
    accountRating: {
      worldchess_rating: 1200,
      worldchess_bullet: 1200,
      worldchess_blitz: 1200,
      worldchess_rapid: 1200,
      fide_rating: 0,
      fide_bullet: 0,
      fide_blitz: 0,
      fide_rapid: 0,
    } as IAccountRating,
    socketMessages: [],
    pgnUrl: null,
    pgnName: null,
    timeControls: [],
    selectedTimeControl: null,
    canCallAnArbiter: true,
    gameRatingMode: GameRatingMode.UNRATED,
    capturedByBlack: null,
    capturedByWhite: null,
    isCheck: false,
    checkmateState: CheckmateState.NoCheckmate,
    checkmateStateReview: CheckmateState.NoCheckmate,
    force: {
      whiteForce: 0,
      blackForce: 0
    },
    opponentMode: OpponentMode.BOT,
    lastOpponentMode: OpponentMode.BOT,
    lastRequestOpponentUID: null,
    promotionPopupVisible: false,
    gameMenuVisible: false,
    playerTimeLimitNotification: TimeLimitWarningType.NoTimeLimitWarning,
    opponentTimeLimitNotification: TimeLimitWarningType.NoTimeLimitWarning,
    boardIsFlipped: false,
    bugReportModalOpened: false,
    onlineRatings: [],
    startIndexOnlineRatingRange: 0,
    widthOnlineRatingRange: 20,
    onlineRequestFailed: false,
    finalTimerUpdated: false,
    inviteCode: null,
    isCancel: false,
    replayNotification: null,
    isReplay: false,
    isRematch: false,
    rematchInvite: null,
    rematchNotification: null,
    opponentUID: null,
    chatId: null,
    lastChatId: null,
    showChat: false,
    newMessage: null,
    timerInitializedInMoves: false,
    quickstart: null,
    boardSubscribed: false,
    connectionActive: true,
    lastConnectActive: true,
};

export interface IOnlineRating {
  rating: number;
  count: number;
}

const PRO_PLAN_STRIPE_ID = environment.pro_plan_stripe_id;
const FIDE_PLAN_STRIPE_ID = environment.fide_id_plan_stripe_id;
const PREMIUM_PLAN_PRODUCT = environment.premium_plan_stripe_id;

@State<IGameState>({
  name: 'GameState',
  defaults: defaultState,
})
export class GameState implements NgxsOnInit {
  static isMyTurnToMove(state: IGameState, isWhiteTurn) {
    return (state.playerColor === ChessColors.White && isWhiteTurn)
      || (state.playerColor === ChessColors.Black && !isWhiteTurn);
  }

  @Selector()
  static board(state: IGameState) {
    return state.board;
  }

  @Selector()
  static error(state: IGameState) {
    return state.error;
  }

  @Selector()
  static boardId(state: IGameState) {
    return state.boardId;
  }

  @Selector()
  static jwt(state: IGameState) {
    return state.jwt || window.localStorage.getItem('gaming-jwt');
  }

  @Selector()
  static getGameSettings(state: IGameState) {
    if (!state.gameSettings) {
      if (state.account) {
        return {
          board_last_move_style: state.account.board_last_move_style || IAccountGameLastMove.HIGHLIGHT,
          board_legal_move_style: state.account.board_legal_move_style || IAccountLegalMove.SHOWDOTS,
          is_sound_enabled: state.account.is_sound_enabled || false,
          board_style: state.account.board_style || IAccountGameBoardStyle.STANDARD,
        };
      } else {
        return {
          board_style: IAccountGameBoardStyle.STANDARD,
          board_last_move_style: IAccountGameLastMove.HIGHLIGHT,
          board_legal_move_style: IAccountLegalMove.SHOWDOTS,
          is_sound_enabled: true,
        };
      }
    } else {
      return state.gameSettings;
    }
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
  static timerInitializedInMoves(state: IGameState) {
    return state.timerInitializedInMoves;
  }

  @Selector()
  static getIsRematch(state: IGameState) {
    return state.isRematch;
  }

  @Selector()
  static getQuickStart(state: IGameState) {
    return state.quickstart;
  }


  @Selector()
  static isMyMove(state: IGameState): boolean {
    if (!state.board || !state.gameReady || state.gameResult && state.finalTimerUpdated) {
      return false;
    }

    if (state.playerColor === ChessColors.White && state.board.moves.length === 0) {
      return true;
    }

    if (state.board.moves.length === 0) {
      return false;
    }

    const lastMove = state.board.moves.slice(-1).pop();
    return !(GameState.isMyTurnToMove(state, lastMove.is_white_move));
  }

  @Selector([GameState.isMyMove])
  static isOpponentMove(state: IGameState, isMyMove): boolean {
    if (!state.board || !state.gameReady || state.gameResult  && state.finalTimerUpdated) {
      return false;
    }

    return !isMyMove;
  }

  @Selector()
  static waitingOpponent(state: IGameState): boolean {
    return state.waitingOpponent;
  }

  @Selector()
  static getOpponentUID(state: IGameState): string {
    return state.opponent.uid;
  }

  @Selector()
  static gameReady(state: IGameState): boolean {
    return state.gameReady;
  }

  @Selector()
  static getChatId(state: IGameState): string {
    return state.chatId;
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
  static accountRating(state: IGameState): IAccountRating {
    return state.accountRating;
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

  @Selector()
  static capturedByPlayer(state: IGameState): TFigure[] {
    if (state.playerColor === ChessColors.Black) {
      return state.capturedByBlack;
    }

    return state.capturedByWhite;
  }

  @Selector()
  static capturedByOpponent(state: IGameState): TFigure[] {
    if (state.playerColor === ChessColors.Black) {
      return state.capturedByWhite;
    }

    return state.capturedByBlack;
  }

  @Selector([GameState.isMyMove])
  static getCheckState(state: IGameState, isMyMove: boolean): CheckState {
    if (state.isCheck) {
      if (isMyMove) {
        return CheckState.OpponentChecks;
      }

      return CheckState.PlayerChecks;
    }
    return CheckState.NoCheck;
  }

  @Selector()
  static checkMateColor(state: IGameState): ChessColors {
    if (state.checkmateState === CheckmateState.NoCheckmate) {
      return null;
    }
    return state.checkmateState === CheckmateState.BlackCheckmates
      ? ChessColors.White
      : ChessColors.Black;
  }

  @Selector()
  static checkMateColorReview(state: IGameState): ChessColors {
    if (state.checkmateStateReview === CheckmateState.NoCheckmate) {
      return null;
    }
    return state.checkmateStateReview === CheckmateState.BlackCheckmates
      ? ChessColors.White
      : ChessColors.Black;
  }

  @Selector()
  static isPlayerOfferedDraw(state: IGameState): boolean {
    return state.playerOfferedDraw;
  }

  @Selector()
  static isPlayerReadyToOfferDraw(state: IGameState): boolean {
    return state.playerReadyToOfferDraw;
  }

  @Selector()
  static isLetsPlayNotification(state: IGameState): boolean {
    return state.letsPlayNotification;
  }

  @Selector()
  static getLastChatId(state: IGameState): string {
    return state.lastChatId;
  }

  @Selector()
  static isPlayerAnonymous(state: IGameState): boolean {
    return !state.account;
  }

  @Selector()
  static force(state: IGameState): IForce {
    return state.force;
  }

  @Selector()
  static gameRatingMode(state: IGameState): GameRatingMode {
    return state.gameRatingMode;
  }

  @Selector()
  static promotionPopupVisible(state: IGameState): boolean {
    return state.promotionPopupVisible;
  }

  @Selector()
  static gameMenuVisible(state: IGameState): boolean {
    return state.gameMenuVisible;
  }

  @Selector()
  static opponentMode(state: IGameState): OpponentMode {
    return state.opponentMode;
  }

  @Selector()
  static lastOpponentMode(state: IGameState): OpponentMode {
    return state.lastOpponentMode;
  }

  @Selector()
  static playerTimeLimitNotification(state: IGameState): boolean {
    return state.playerTimeLimitNotification !== TimeLimitWarningType.NoTimeLimitWarning;
  }

  @Selector()
  static opponentTimeLimitNotification(state: IGameState): boolean {
    return state.opponentTimeLimitNotification !== TimeLimitWarningType.NoTimeLimitWarning;
  }

  @Selector()
  static isBoardFlipped(state: IGameState): boolean {
    return state.boardIsFlipped;
  }

  @Selector()
  static isBugReportModalOpened(state: IGameState): boolean {
    return state.bugReportModalOpened;
  }

  @Selector()
  static onlineRatings(state: IGameState): IOnlineRating[] {
    return state.onlineRatings;
  }

  @Selector()
  static startIndexOnlineRatingRange(state: IGameState): number {
    return state.startIndexOnlineRatingRange;
  }

  @Selector()
  static widthOnlineRatingRange(state: IGameState): number {
    return state.widthOnlineRatingRange;
  }

  @Selector()
  static onlineRequestFailed(state: IGameState): boolean {
    return state.onlineRequestFailed;
  }

  @Selector()
  static playerType(state: IGameState): PlayerType {
    if (!state.account) {
      return PlayerType.Anonymous;
    }

    if (state.account.subscriptions.find(
      s => s.is_active && [FIDE_PLAN_STRIPE_ID].indexOf(s.plan.stripe_id) !== -1)
    ) {
      return PlayerType.FidePlayer;
    }

    return PlayerType.WCPlayer;
  }

  @Selector()
  static currentSelectedRating(state: IGameState): number {
    if (state.selectedTimeControl) {
      switch (state.gameRatingMode) {
        case GameRatingMode.FIDERATED:
          switch (state.selectedTimeControl.board_type) {
            case BoardType.BLITZ:
              return state.accountRating && state.accountRating.fide_blitz;
            case BoardType.BULLET:
              return state.accountRating && state.accountRating.fide_bullet;
            case BoardType.RAPID:
              return state.accountRating && state.accountRating.fide_rapid;
          }
          break;
        case GameRatingMode.RATED:
        default:
          switch (state.selectedTimeControl.board_type) {
            case BoardType.BLITZ:
              return state.accountRating && state.accountRating.worldchess_blitz;
            case BoardType.BULLET:
              return state.accountRating && state.accountRating.worldchess_bullet;
            case BoardType.RAPID:
              return state.accountRating && state.accountRating.worldchess_rapid;
          }
      }
    }

    return 1200;
  }

  @Selector()
  static getInviteCode(state: IGameState): string {
    return state.inviteCode;
  }

  @Selector()
  static getCancelInvite(state: IGameState): boolean {
    return  state.isCancel;
  }

  @Selector()
  static getReplayNotification(state: IGameState): string {
    return  state.replayNotification;
  }

  @Selector()
  static getUID(state: IGameState): string {
    return state.uid;
  }

  @Selector()
  static getIsReplay(state: IGameState): boolean {
    return state.isReplay;
  }

  @Selector()
  static getRematchInvite(state: IGameState): string {
    return state.rematchInvite;
  }

  @Selector()
  static getRematchNotification(state: IGameState): string {
    return state.rematchNotification;
  }

  @Selector()
  static getShowChat(state: IGameState): boolean {
    return state.showChat;
  }

  @Selector()
  static isSubscribedToBoard(state: IGameState): boolean {
    return state.boardSubscribed;
  }

  @Selector()
  static getNewMessage(state: IGameState): INewMessage {
    if (!state.newMessage) {
      return {
        id: 0,
        userId: 0,
        isNew: false,
        isChat: false,
        isFirst: true,
      };
    } else {
      return state.newMessage;
    }
  }

  @Selector()
  static connectionActive(state: IGameState): boolean {
    return state.connectionActive;
  }

  @Selector()
  static getLastConnectionActive(state: IGameState): boolean {
    return state.lastConnectActive;
  }

  constructor(
    private resource: GameResourceService,
    private store$: NgrxStore<forRoot.State>,
    private store: Store,
    private gameSharedService: GameSharedService,
    private accountResourceService: AccountResourceService,
    private accStore: NgrxStore<fromAccount.State>,
    private translateService: TranslateService,
  ) {
    this.store$.dispatch(new AuthGetUid({ needSetCookie: false }));
  }

  @Action({type: 'Set uid'})
  setUid(ctx: StateContext<IGameState>, action: {uid: string}) {
    const state = ctx.getState();
    if (state.uid && state.uid === action.uid) {
      return;
    }

    this.accStore.pipe(
      select(fromAccount.selectMyAccount)
    ).subscribe(acc => {
      if (acc) {
        ctx.patchState({
          uid: action.uid,
          account: acc,
          gameSettings: {
            board_last_move_style: acc.board_last_move_style || IAccountGameLastMove.HIGHLIGHT,
            board_legal_move_style: acc.board_legal_move_style || IAccountLegalMove.SHOWDOTS,
            is_sound_enabled: acc.is_sound_enabled || false,
            board_style: acc.board_style || IAccountGameBoardStyle.STANDARD,
          }
        });
      }
    });

    ctx.patchState({
      uid: action.uid,
    });
  }

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

  @Action(SetShowChat)
  setShowChat(ctx: StateContext<IGameState>, action: SetShowChat) {
    ctx.patchState({
      showChat: action.isShow
    });
  }

  @Action(UpdateTourJWT)
  updateTourJWT(ctx: StateContext<IGameState>, action: UpdateTourJWT) {
    window.localStorage.setItem('gaming-jwt', action.jwt);
    window.localStorage.removeItem('next-tour-jwt');
    ctx.patchState({
      jwt: action.jwt
    });
  }

  @Action(AddNewMove)
  addNewMove(ctx: StateContext<IGameState>, action: AddNewMove) {
    const state = ctx.getState();

    const isMyMove = GameState.isMyMove(state);
    let _patch: Partial<IGameState> = {};

    if (action.move.seconds_left) {
      if (GameState.isMyTurnToMove(state, action.move.is_white_move)) {
        _patch.playerTimer = action.move.seconds_left;
      } else {
        _patch.opponentTimer = action.move.seconds_left;
      }
    }

    let lastMove: IGameMove;
    if (state.board) {
      lastMove = state.board.moves
        && state.board.moves[state.board.moves.length - 1];
    }

    if (lastMove && (lastMove.fen === action.move.fen)) {
      // если ход явлется последним, то обновляем только оставшееся время
      ctx.patchState(_patch);
      return;
    }

    if (action.move.move_number === 1 && isMyMove) {
      window['dataLayerPush'](
        'wchGame',
        'Game',
        'Moves',
        this.gameSharedService.convertGameMode(state.gameRatingMode),
        null,
        null
      );
    }

    _patch = {
      ..._patch,
      board: {
        ...state.board,
        moves: [
          ...(state.board || {moves: []}).moves.filter(move => !(
            move.is_white_move === action.move.is_white_move &&
            move.san === action.move.san &&
            move.move_number === action.move.move_number
          )),
          action.move,
        ]
      },
      notification: isMyMove ? 'Opponent move!' : 'Your move!',
      letsPlayNotification: state.playerOfferedDraw && !isMyMove,
      playerOfferedDraw: isMyMove ? state.playerOfferedDraw : false,
      opponentOfferedDraw: isMyMove ? false : state.opponentOfferedDraw,
    };

    if (action.source === ActionSource.USER && state.board) {
      this.resource.addNewMove(state.board.id, action.move);
    }

    if (isMyMove && state.playerReadyToOfferDraw) {
      this.resource.callToDraw(state.board.id);
      _patch = {
        ..._patch,
        playerOfferedDraw: true,
        playerReadyToOfferDraw: false
      };
    }

    if (isMyMove && state.playerTimeLimitNotification === TimeLimitWarningType.IdleTimeLimitWarning) {
      _patch = {
        ..._patch,
        playerTimeLimitNotification: TimeLimitWarningType.NoTimeLimitWarning
      };
    } else if (!isMyMove && state.opponentTimeLimitNotification === TimeLimitWarningType.IdleTimeLimitWarning) {
      _patch = {
        ..._patch,
        opponentTimeLimitNotification: TimeLimitWarningType.NoTimeLimitWarning
      };
    }

    ctx.patchState(_patch);
  }

  @Action(AddGameBoard)
  addGameBoard(ctx: StateContext<IGameState>, action: AddGameBoard) {
    const state = ctx.getState();
    if (!action.board) {
      return ctx.patchState({
        boardId: null,
        board: null,
      });
    }

    if (state.boardId !== action.board.id) {
      ctx.patchState({
        boardId: action.board.id,
      });
    }

    let player = action.board.white_player;
    let opponent = action.board.black_player;
    let playerColor = ChessColors.White;

    if (!state.uid) {
      playerColor = state.playerColor;
      if (playerColor === ChessColors.Black) {
        player = action.board.black_player;
        opponent = action.board.white_player;
      }
    } else if (action.board.black_player.uid === state.uid) {
      player = action.board.black_player;
      playerColor = ChessColors.Black;
      opponent = action.board.white_player;
    }

    ctx.patchState({
      player,
      opponent,
      playerColor,
      board: action.board,
      gameReady: true,
      waitingOpponent: false,
      isResultShown: false,
      endReason: null,
      rematchNotification: null,
      replayNotification: null,
      gameResult: null,
      opponentUID: opponent.uid
    });
  }

  @Action(TourBoardReady)
  tourReady(ctx: StateContext<IGameState>, action: TourBoardReady) {
    const state = ctx.getState();
    if (!action.board) {
      return ctx.patchState({
        board: null
      });
    }

    let player = action.board.white_player;
    let opponent = action.board.black_player;
    let playerColor = ChessColors.White;

    if (!state.uid) {
      playerColor = state.playerColor;
      if (playerColor === ChessColors.Black) {
        player = action.board.black_player;
        opponent = action.board.white_player;
      }
    } else if (action.board.black_player.uid === state.uid) {
      player = action.board.black_player;
      playerColor = ChessColors.Black;
      opponent = action.board.white_player;
    }

    ctx.patchState({
      player,
      opponent,
      playerColor,
      board: action.board,
      gameReady: false,
      isCheck: false,
      checkmateState: CheckmateState.NoCheckmate,
      checkmateStateReview: CheckmateState.NoCheckmate,
      waitingOpponent: false,
      isResultShown: false,
      endReason: null,
      rematchNotification: null,
      replayNotification: null,
      gameResult: null,
      opponentUID: opponent.uid
    });
  }

  @Action(SetPlayerColor)
  setPlayerColor(ctx: StateContext<IGameState>, action: SetPlayerColor) {
    ctx.patchState({
      playerColor: action.color,
    });
  }

  @Action(SetChatId)
  setChatId(ctx: StateContext<IGameState>, action: SetChatId) {
    ctx.patchState({
      chatId: action.chatId,
      lastChatId: action.chatId
    });
  }

  @Action(ClearOnlineRequestStatus)
  clearOnlineRequestStatus(ctx: StateContext<IGameState>, action: ClearOnlineRequestStatus) {
    ctx.patchState({
      onlineRequestFailed: false,
    });
  }

  @Action(RequestOpponent)
  requestOpponent(ctx: StateContext<IGameState>, action: RequestOpponent) {
    const state = ctx.getState();
    const timeControlId = state.selectedTimeControl && state.selectedTimeControl.id || 9;
    const gameRatingMode = state.gameRatingMode;
    const opponentMode = state.opponentMode; // === OpponentMode.COMPUTER ? 'bot' : '';
    const ratingLimits = {
      lower: state.onlineRatings[state.startIndexOnlineRatingRange].rating,
      upper: state.onlineRatings[state.startIndexOnlineRatingRange + state.widthOnlineRatingRange].rating
    };
    let oppUID = null;

    if (action.oppUID) {
      oppUID = action.oppUID;
    }

    this.resource.requestOpponent(
      timeControlId, gameRatingMode, opponentMode, ratingLimits, oppUID
    ).subscribe(response => {
      ctx.patchState({
        inviteCode: response.invite_code
      });

      if (response.responseStatus === OnlineRequestResponseStatus.Success) {
        ctx.patchState({
          gameReady: false,
          waitingOpponent: true,
          isReplay: false,
          rematchInvite: null,
          endReason: null,
          requestOpponentUID: response.uid,
          lastRequestOpponentUID: response.uid,
          rating: response.rating,
        });
      }
      if (response.responseStatus === OnlineRequestResponseStatus.Fail) {
        ctx.patchState({
          waitingOpponent: false,
          onlineRequestFailed: true
        });
      }
    });
  }

  @Action(RequestInvite)
  requestInvite(ctx: StateContext<IGameState>, action: RequestInvite) {
    const state = ctx.getState();
    this.resource.requestInvite(action.invite, state.uid, action.oppMode)
      .pipe(
        catchError(() => of(null))
      ).subscribe(data => {
      if ( data['errorCode']) {
        this.store.dispatch(new SetNotification(`${data['errorMsg']}`));
        this.store.dispatch(new SetCancelInvite(false));
      } else {
        if (data['opp_mode'] === OpponentMode.FRIEND) {
          this.translateService.get('MESSAGES.FEW_SECONDS').pipe(take(1))
            .subscribe((msg) => this.store.dispatch(new SetNotification(msg)));
        }
        this.store.dispatch(new SetSelectedTimeControl(data['time_control'][0]));
        this.store.dispatch(new SetSelectedRatingMode(data['rating'][0]));
        this.store.dispatch(new SetInviteCode(
          data['opp_mode'],
          data['invite_code'],
          data['uid']
        ));
        }
      });
  }

  @Action(RejectOpponentRequest)
  rejectOpponentRequest(ctx: StateContext<IGameState>, action: RejectOpponentRequest) {
    const state = ctx.getState();

    ctx.patchState({
      waitingOpponent: false,
      inviteCode: null
    });

    this.resource.rejectOpponentRequest(state.requestOpponentUID).subscribe();
  }

  @Action(RejectOpponentRequestLast)
  requestOpponentRequestLast(ctx: StateContext<IGameState>, action: RejectOpponentRequestLast) {
    const state = ctx.getState();

    ctx.patchState({
      waitingOpponent: false,
    });
    this.resource.rejectOpponentRequest(state.lastRequestOpponentUID, state.opponentUID).subscribe();
  }

  @Action(InviteCancelRequest)
  inviteCancelRequest(ctx: StateContext<IGameState>, action: InviteCancelRequest) {
    const state = ctx.getState();
    this.resource.inviteCancelRequest(
      state.rematchInvite,
      state.player.uid
    ).subscribe();
  }

  @Action(ResetRematch)
  resetRematch(ctx: StateContext<IGameState>, action: ResetRematch) {
    ctx.patchState({
      isRematch: false,
      isReplay: false,
      replayNotification: null,
      rematchNotification: null,
      rematchInvite: null,
      endReason: null
    });
  }

  @Action(Resign)
  callToResign(ctx: StateContext<IGameState>, action: Resign) {
    const state = ctx.getState();
    this.resource.callToResign(state.board.id);
  }

  @Action(Draw)
  callToDraw(ctx: StateContext<IGameState>, action: Draw) {
    const state = ctx.getState();

    if (state.opponentOfferedDraw) {
      ctx.patchState({
        opponentOfferedDraw: false
      });
      this.resource.callToDraw(state.board.id);
    } else {
      ctx.patchState({
        playerReadyToOfferDraw: true
      });
    }
  }

  @Action(CancelDraw)
  cancelDraw(ctx: StateContext<IGameState>, action: Draw) {
    const state = ctx.getState();

    if (state.playerReadyToOfferDraw) {
      ctx.patchState({
        playerReadyToOfferDraw: false
      });
    }

    if (state.playerOfferedDraw) {
      ctx.patchState({
        playerOfferedDraw: false
      });
      this.resource.cancelDrawOffer(state.board.id);
    }
  }

  @Action(GameError)
  setError(ctx: StateContext<IGameState>, action: GameError) {
    ctx.patchState({
      error: action.text,
    });
  }

  @Action(OpponentOfferADraw)
  opponentOfferADraw(ctx: StateContext<IGameState>, action: OpponentOfferADraw) {
    ctx.patchState({
      opponentOfferedDraw: action.offer,
    });
  }

  @Action(GameBoardCreated)
  boardCreated(ctx: StateContext<IGameState>, action: GameBoardCreated) {
    window.localStorage.setItem('gaming-jwt', action.jwt);
    const state = ctx.getState();
    ctx.patchState({
      boardId: action.boardId,
      playerColor: state.uid === action.whitePlayerUid ? ChessColors.White : ChessColors.Black,
      jwt: action.jwt,
      isRematch: false,
      isReplay: false,
      endReason: null,
      inviteCode: null,
      rematchInvite: null,
      rematchNotification: null,
      replayNotification: null,
    });
  }

  @Action(SubscribeToBoard)
  subscribeToBoard(ctx: StateContext<IGameState>, action: SubscribeToBoard) {
    const state = ctx.getState();
    this.resource.subscribeToBoard(state.boardId, action.jwt || state.board.jwt);
  }

  @Action(SetBoardSubscribed)
  setBoardSubscribed(ctx: StateContext<IGameState>, action: SetBoardSubscribed) {
    ctx.patchState({
      boardSubscribed: action.flag
    });
  }


  @Action(GameReady)
  gameReady(ctx: StateContext<IGameState>, action: GameReady) {
    ctx.patchState({
      gameReady: true,
    });
    // this.resource.startPing();
  }

  /**
   * Set flage for gameReady
   * @param ctx state
   * @param action
   */
  @Action(SetGameReady)
  setGameReady(ctx: StateContext<IGameState>, action: SetGameReady) {
    ctx.patchState({
      gameReady: action.isGame
    });
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

  @Action(DownloadPGN)
  downloadPGN(ctx: StateContext<IGameState>, action: DownloadPGN) {
    const state = ctx.getState();
    let pgnUrl = state.pgnUrl;
    let pgnName = state.pgnName;

    if (action.pgnUrl) {
      pgnUrl = action.pgnUrl;
    }
    if (action.pgnUrl) {
      pgnName = action.pgnName;
    }

    this.resource.getPGN(pgnUrl)
      .subscribe(x => {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([x], { type: 'application/text' });

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(newBlob);
          return;
        }

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const data = window.URL.createObjectURL(newBlob);

        const link = document.createElement('a');
        link.href = data;
        link.download = `PGN-${pgnUrl.split('/')[4]}.pgn`;
        if (pgnName) {
          link.download = pgnName;
        }
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        setTimeout(function () {
          // For Firefox it is necessary to delay revoking the ObjectURL
          window.URL.revokeObjectURL(data);
          link.remove();
        }, 100);
      });
  }

  @Action(RestartGame)
  restartGame(ctx: StateContext<IGameState>, action: RestartGame) {
    const state = ctx.getState();
    if (state.board) {
      if (state.board.moves.length > 1) {
        this.resource.callToResign(state.board.id);
      } else {
        this.resource.abortGame(state.board.id, state.player.uid);
      }
    }
    window.localStorage.removeItem('gaming-jwt');
    ctx.setState({
      ... defaultState,
      // player: state.player,
      jwt: null,
      uid: state.uid,
      lastOpponentMode: state.lastOpponentMode,
      lastRequestOpponentUID: state.lastRequestOpponentUID,
      account: state.account,
      timeControls: state.timeControls,
      accountRating: state.accountRating,
      onlineRatings: state.onlineRatings,
      startIndexOnlineRatingRange: state.startIndexOnlineRatingRange,
      widthOnlineRatingRange: state.widthOnlineRatingRange,
      replayNotification: state.replayNotification,
      rematchNotification: state.rematchNotification,
      isRematch: state.isRematch,
      opponentUID: state.opponentUID,
      lastChatId: state.lastChatId
    });
    if (state.account) {
      ctx.setState({
        ...ctx.getState(),
        gameSettings: {
          board_last_move_style: state.account.board_last_move_style,
          board_legal_move_style: state.account.board_legal_move_style,
          board_style: state.account.board_style,
          is_sound_enabled: state.account.is_sound_enabled,
        }
      });
    }
    ctx.dispatch(new SetSelectedTimeControl(state.selectedTimeControl));
    ctx.dispatch(new SetSelectedRatingMode(state.gameRatingMode));
  }

  @Action(ShowGameResult)
  showGameResult(ctx: StateContext<IGameState>, action: ShowGameResult) {
    ctx.patchState({
      isResultShown: action.show,
    });
  }

  @Action(SetPlayerTimer)
  setPlayerTimer(ctx: StateContext<IGameState>, action: SetPlayerTimer) {
    ctx.patchState({
      playerTimer: action.timer,
    });
  }

  @Action(SetOpponentTimer)
  setOpponentTimer(ctx: StateContext<IGameState>, action: SetOpponentTimer) {
    ctx.patchState({
      opponentTimer: action.timer,
    });
  }

  @Action(InitRatingRange)
  initRatingRange(ctx: StateContext<IGameState>, action: InitRatingRange) {
    const state = ctx.getState();
    const currentRating = GameState.currentSelectedRating(state);
    const startIndex = currentRating > 100 ? Math.floor((currentRating - 100) / 10) : 0;

    this.accStore.pipe(
      select(fromAccount.selectMyAccount)
    ).subscribe(accounts => {
      ctx.patchState({
        account: accounts
      });
    });

    ctx.patchState({
      startIndexOnlineRatingRange: startIndex,
      widthOnlineRatingRange: 20
    });
  }

  @Action(SetGameResult)
  setGameResult(ctx: StateContext<IGameState>, action: SetGameResult) {
    const state = ctx.getState();
    let gameResult: GameResult;

    if (action.result === Result.WHITE_WIN) {
      gameResult = state.playerColor === ChessColors.White ? GameResult.WON : GameResult.LOST;
    }

    if (action.result === Result.BLACK_WIN) {
      gameResult = state.playerColor === ChessColors.Black ? GameResult.WON : GameResult.LOST;
    }

    if (action.result === Result.DRAW) {
      gameResult = GameResult.DRAW;
    }

    if (gameResult === GameResult.LOST && action.reason === EndReason.TIME_CONTROL) {
      ctx.patchState({
        playerTimer: 0
      });
    }

    ctx.patchState({
      gameResult,
      boardSubscribed: false,
      endReason: action.reason,
      isRematch: false,
      isReplay: false,
      rematchNotification: null,
      replayNotification: null,
      playerOfferedDraw: false,
      opponentOfferedDraw: false,
      playerTimeLimitNotification: TimeLimitWarningType.NoTimeLimitWarning,
      opponentTimeLimitNotification: TimeLimitWarningType.NoTimeLimitWarning,
    });

    // this.resource.stopPing();
  }

  @Action(ClearGameResult)
  clearGameResult(ctx: StateContext<IGameState>, action: ClearGameResult) {
    ctx.patchState({
      gameResult: null,
      endReason: null,
    });
  }

  @Action(SetNotification)
  setNotification(ctx: StateContext<IGameState>, action: SetNotification) {
    ctx.patchState({
      notification: action.notification
    });
  }

  @Action(SetTimeLimitNotification)
  setTimeLimitNotification(ctx: StateContext<IGameState>, action: SetTimeLimitNotification) {
    const state = ctx.getState();
    if (action.playerUid) {
      if (action.playerUid === state.opponent.uid) {
        ctx.patchState({
          opponentTimeLimitNotification: action.notification
        });
      } else {
        ctx.patchState({
          playerTimeLimitNotification: action.notification
        });
      }
    } else {
      ctx.patchState({
        playerTimeLimitNotification: action.notification
      });
    }
  }

  @Action(SetRatingChange)
  setRatingChange(ctx: StateContext<IGameState>, action: SetRatingChange) {
    const state = ctx.getState();
    let opponent = state.opponent;
    let player = state.player;

    if (state.ratingChange !== action.rating && action.boardID === state.boardId) {
      if (state.opponent.uid === action.userUID) {
        opponent = {
          ... opponent,
          rating: Number(opponent.rating) + action.rating,
        };
      }
      if (state.player.uid === action.userUID) {
        player = {
          ... player,
          rating: Number(player.rating) + action.rating,
        };
      }

      ctx.patchState({
        player,
        opponent,
        ratingChange: action.rating,
      });
    }
  }

  @Action(SetAccount)
  setAccount(ctx: StateContext<IGameState>, action: SetAccount) {
    const state = ctx.getState();
    if (state.account && !action.account && state.player) {
      ctx.patchState({
        player: null,
      });
    }

    const _patch: any = {};
    if (action.account && action.account.uid) {
      _patch.uid = action.account && action.account.uid;
    }

    ctx.patchState({
      ..._patch,
      account: action.account,
      gameSettings: {
        board_last_move_style:  (action.account) ? action.account.board_last_move_style : IAccountGameLastMove.HIGHLIGHT,
        board_legal_move_style: (action.account) ? action.account.board_legal_move_style : IAccountLegalMove.SHOWDOTS,
        is_sound_enabled: (action.account) ? action.account.is_sound_enabled : false,
        board_style: (action.account) ? action.account.board_style : IAccountGameBoardStyle.STANDARD
      }
    });
  }

  @Action(SetAccountRating)
  setAccountRating(ctx: StateContext<IGameState>, action: SetAccountRating) {
    ctx.patchState({
      accountRating: action.accountRating
    });
  }

  @Action(SetPgnUrl)
  setPgnUrl(ctx: StateContext<IGameState>, action: SetPgnUrl) {
    const state = ctx.getState();

    if (state.board && state.board.id === action.board_id) {
      ctx.patchState({
        pgnUrl: action.pgnUrl,
        pgnName: action.pgn_download_name
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

    this.resource.sendBugReport(
      user_uid, action.report, action.email,
      action.type, boardId, log).subscribe();
  }

  @Action(GetTimeControls)
  getTimeControls(ctx: StateContext<IGameState>, action: GetTimeControls) {
    if (ctx.getState()
      && ctx.getState().timeControls
      && ctx.getState().timeControls.length) {
      return;
    }

    this.resource.getTimerControls();
  }

  @Action(SetTimeControls)
  setTimeControls(ctx: StateContext<IGameState>, action: SetTimeControls) {
    const state = ctx.getState();
    ctx.patchState({
      timeControls: action.timeControls,
      isCancel: state.isCancel,
    });
  }

  @Action(SetSelectedTimeControl)
  setSelectedTimeControl(ctx: StateContext<IGameState>, action: SetSelectedTimeControl) {
    if (!action.timeControl) {
      return;
    }

    const timerInSeconds = moment(action.timeControl.start_time, 'HH:mm:ss').minutes() * 60;
    const state = ctx.getState();
    if (state.inviteCode !== '') {
      ctx.patchState({
        selectedTimeControl: action.timeControl,
        playerTimer: timerInSeconds,
        opponentTimer: timerInSeconds,
      });
      ctx.dispatch(new GetOnlineRatings());
    }
  }

  @Action(SetSelectedRatingMode)
  setSelectedRatingMode(ctx: StateContext<IGameState>, action: SetSelectedRatingMode) {
    ctx.patchState({
      gameRatingMode: action.gameRatingMode,
    });

    ctx.dispatch(new GetOnlineRatings());
  }

  @Action(SetSelectedTimeControlRatingMode)
  setSelectedTimeControlRatingMode(ctx: StateContext<IGameState>, action: SetSelectedTimeControlRatingMode) {
    if (!action.timeControl || !action.gameRatingMode) {
      return;
    }

    const timerInSeconds = moment(action.timeControl.start_time, 'HH:mm:ss').minutes() * 60;

    ctx.patchState({
      selectedTimeControl: action.timeControl,
      gameRatingMode: action.gameRatingMode,
      playerTimer: timerInSeconds,
      opponentTimer: timerInSeconds,
    });
  }

  @Action(SetOpponentMode)
  setOpponentMode(ctx: StateContext<IGameState>, action: SetOpponentMode) {
    ctx.patchState({
      opponentMode: action.opponentMode,
      lastOpponentMode: action.opponentMode
    });
  }

  @Action(SetInviteCode)
  setInviteCode(ctx: StateContext<IGameState>, action: SetInviteCode) {
    ctx.patchState({
      opponentMode: action.opponentMode,
      lastOpponentMode: action.opponentMode,
      inviteCode: action.inviteCode,
      waitingOpponent: true,
      requestOpponentUID: action.requestOpponentUID,
    });
  }

  @Action(CallAnArbiter)
  callAnArbiter(ctx: StateContext<IGameState>, action: CallAnArbiter) {
    const state = ctx.getState();
    if (state && state.board) {
      this.resource.callAnArbiter(state.board.id, state.player.uid).subscribe();

      ctx.patchState({
        canCallAnArbiter: false
      });
    }
  }

  @Action(AbortGame)
  abortGame(ctx: StateContext<IGameState>, action: AbortGame) {
    const state = ctx.getState();
    this.resource.abortGame(state.board.id, state.player.uid);
  }

  @Action(SetCancelInvite)
  setCancelInvite(ctx: StateContext<IGameState>, action: SetCancelInvite) {
    ctx.patchState({
      isCancel: action.isCancel
    });
  }

  @Action(SetCapturedByBlack)
  setCapturedByBlack(ctx: StateContext<IGameState>, action: SetCapturedByBlack) {
    ctx.patchState({
      capturedByBlack: action.figures,
    });
  }

  @Action(SetCapturedByWhite)
  setCapturedByWhite(ctx: StateContext<IGameState>, action: SetCapturedByWhite) {
    ctx.patchState({
      capturedByWhite: action.figures,
    });
  }

  @Action(SetCheck)
  setCheck(ctx: StateContext<IGameState>, action: SetCheck) {
    ctx.patchState({
      isCheck: action.isCheck,
    });
  }

  @Action(SetReplayNotification)
  setReplayNotification(ctx: StateContext<IGameState>, action: SetReplayNotification) {
    if (action.notification !== '') {
      ctx.patchState({
        isReplay: true
      });
    }
    ctx.patchState({
      replayNotification: action.notification
    });
  }

  @Action(SetFlagReplay)
  setFlagReplay(ctx: StateContext<IGameState>, action: SetFlagReplay) {
    ctx.patchState({
      isReplay: action.isReplay
    });
  }

  @Action(SetFlagRematch)
  setFlagRematch(ctx: StateContext<IGameState>, action: SetFlagRematch) {
    ctx.patchState({
      isRematch: action.isRematch
    });
  }

  @Action(SetRematchInvite)
  setRematchInvite(ctx: StateContext<IGameState>, action: SetRematchInvite) {
    const state = ctx.getState();
    ctx.patchState({
      rematchInvite: action.rematchInvite,
      rematchNotification: `${state.opponent.full_name} offers to play again`,
      isRematch: false,
    });
  }

  @Action(SetCheckmate)
  setCheckmate(ctx: StateContext<IGameState>, action: SetCheckmate) {
    ctx.patchState({
      checkmateState: action.checkmateState,
    });
  }

  @Action(SetCheckmateReview)
  setCheckmateReview(ctx: StateContext<IGameState>, action: SetCheckmateReview) {
    ctx.patchState({
      checkmateStateReview: action.checkmateState,
    });
  }

  @Action(SetForce)
  setForce(ctx: StateContext<IGameState>, action: SetForce) {
    ctx.patchState({
      force: {
        whiteForce: action.whiteForce,
        blackForce: action.blackForce,
      },
    });
  }

  @Action(SetPromotionPopupVisible)
  setPromotionPopupVisible(ctx: StateContext<IGameState>, action: SetPromotionPopupVisible) {
    ctx.patchState({
      promotionPopupVisible: action.promotionPopupVisibile
    });
  }

  @Action(SetGameMenuVisible)
  setGameMenuVisible(ctx: StateContext<IGameState>, action: SetGameMenuVisible) {
    ctx.patchState({
      gameMenuVisible: action.gameMenuVisibile
    });
  }

  @Action(SetGameSettings)
  setGameSettings(ctx: StateContext<IGameState>, action: SetGameSettings) {
    const state = ctx.getState();
    if (state.account) {
      this.accountResourceService.updateProfile({
        board_last_move_style: action.board_last_move_style || IAccountGameLastMove.HIGHLIGHT,
        board_legal_move_style: action.board_legal_move_style || IAccountLegalMove.SHOWDOTS,
        is_sound_enabled: action.is_sound_enabled || false,
        board_style: action.board_style || IAccountGameBoardStyle.STANDARD,
      }).subscribe(data => {
        ctx.patchState({
          account: {
            ...state.account,
            board_last_move_style: data['board_last_move_style'],
            board_legal_move_style: data['board_legal_move_style'],
            is_sound_enabled: data['is_sound_enabled'] || false,
            board_style: data['board_style'] || IAccountGameBoardStyle.STANDARD,
          },
          gameSettings: {
            board_last_move_style: data['board_last_move_style'],
            board_legal_move_style: data['board_legal_move_style'],
            is_sound_enabled: data['is_sound_enabled'] || false,
            board_style: data['board_style'] || IAccountGameBoardStyle.STANDARD,
          }
        });
      });
    }
    ctx.patchState({
      gameSettings: {
        board_last_move_style: action.board_last_move_style || IAccountGameLastMove.HIGHLIGHT,
        board_legal_move_style: action.board_legal_move_style || IAccountLegalMove.SHOWDOTS,
        is_sound_enabled: action.is_sound_enabled || false,
        board_style: action.board_style || IAccountGameBoardStyle.STANDARD,
      }
    });
  }

  @Action(FlipBoard)
  flipBoard(ctx: StateContext<IGameState>, action: FlipBoard) {
    ctx.patchState({
      boardIsFlipped: action.boardIsFlipped
    });
  }

  @Action(SetBugReportModalOpened)
  setBugReportModalOpened(ctx: StateContext<IGameState>, action: SetBugReportModalOpened) {
    ctx.patchState({
      bugReportModalOpened: action.bugReportModalOpened
    });
  }

  @Action(UpdateFinalTimer)
  updateFinalTimer(ctx: StateContext<IGameState>, action: UpdateFinalTimer) {
    ctx.patchState({
      finalTimerUpdated: true
    });
  }

  @Action(SetStartOnlineRatingRange)
  setStartOnlineRatingRange(ctx: StateContext<IGameState>, action: SetStartOnlineRatingRange) {
    ctx.patchState({
      startIndexOnlineRatingRange: action.index
    });
  }

  @Action(SetWidthOnlineRatingRange)
  setWidthOnlineRatingRange(ctx: StateContext<IGameState>, action: SetWidthOnlineRatingRange) {
    ctx.patchState({
      widthOnlineRatingRange: action.width
    });
  }

  @Action(SetLeftExpandingRatingRange)
  setLeftExpandingRatingRange(ctx: StateContext<IGameState>, action: SetLeftExpandingRatingRange) {
    const state = ctx.getState();
    const diff = state.startIndexOnlineRatingRange - action.index;
    ctx.patchState({
      startIndexOnlineRatingRange: action.index,
      widthOnlineRatingRange: state.widthOnlineRatingRange + diff
    });
  }

  @Action(SetOnlineRatings)
  setOnlineRatings(ctx: StateContext<IGameState>, action: SetOnlineRatings) {
    const onlineRatings = [];
    let currentRatingsValue = action.onlineRatings ? action.onlineRatings[0].rating : 3000;
    let currentRatingsIndex = 0;
    for (let i = 0; i < 3000; i += 10) {
      let count = 0;
      if (currentRatingsValue === i) {
        count = action.onlineRatings[currentRatingsIndex].count;
        currentRatingsIndex++;
        currentRatingsValue = currentRatingsIndex < action.onlineRatings.length
          ? action.onlineRatings[currentRatingsIndex].rating
          : 3000;
      }

      onlineRatings.push({
        rating: i,
        count
      });
    }

    ctx.patchState({ onlineRatings });
  }

  @Action(GetOnlineRatings)
  getOnlineRatings(ctx: StateContext<IGameState>, action: GetOnlineRatings) {
    const state = ctx.getState();
    let ratingMode: RatingMode;
    if (state.selectedTimeControl) {
      switch (state.gameRatingMode) {
        case GameRatingMode.FIDERATED:
          switch (state.selectedTimeControl.board_type) {
            case BoardType.BLITZ:
              ratingMode = RatingMode.FIDE_blitz;
              break;
            case BoardType.BULLET:
              ratingMode = RatingMode.FIDE_bullet;
              break;
            case BoardType.RAPID:
              ratingMode = RatingMode.FIDE_rapid;
              break;
          }
          break;
        case GameRatingMode.RATED:
        default:
          switch (state.selectedTimeControl.board_type) {
            case BoardType.BLITZ:
              ratingMode = RatingMode.WC_blitz;
              break;
            case BoardType.BULLET:
              ratingMode = RatingMode.WC_bullet;
              break;
            case BoardType.RAPID:
              ratingMode = RatingMode.WC_rapid;
              break;
          }
          break;
      }
      if (ratingMode) {
        this.resource.getOnlineRatings(ratingMode);
      }
    }
  }

  @Action(SetNewMessage)
  setNewMessage(ctx: StateContext<IGameState>, action: SetNewMessage) {
    ctx.patchState({
      newMessage: {
          id: action.id,
          userId: action.userId,
          isNew: action.isNew,
          isChat: action.isChat,
          isFirst: action.isFirst || false
      }
    });
  }

  @Action(SetDefaultNewMessage)
  setDefaultNewMessage(ctx: StateContext<IGameState>, action: SetDefaultNewMessage) {
    ctx.patchState({
      newMessage: {
        id: 0,
        userId: 0,
        isNew: false,
        isChat: false,
        isFirst: true,
      }
    });
  }

  @Action(SetTimerInitializedInMoves)
  setTimerInitializedInMoves(ctx: StateContext<IGameState>, action: SetTimerInitializedInMoves) {
    ctx.patchState({
     timerInitializedInMoves: action.flag
    });
  }

  @Action(SetQuickstartFlag)
  setQuickstartFlag(ctx: StateContext<IGameState>, action: SetQuickstartFlag) {
    ctx.patchState({
      quickstart: action.startType
    });
  }

  @Action(ResetQuickstartFlag)
  resetQuickstartFlag(ctx: StateContext<IGameState>, action: ResetQuickstartFlag) {
    ctx.patchState({
      quickstart: null
    });
  }

  @Action(SetConnectionActive)
  setConnectionActive(ctx: StateContext<IGameState>, action: SetConnectionActive) {
    const _connectionActive = ctx.getState().connectionActive;
    ctx.setState(
      patch({
        lastConnectActive: _connectionActive,
        connectionActive: action.flag
      })
    );
  }


  ngxsOnInit(ctx?: StateContext<IGameState>): void | any {
    this.store.dispatch(new InitRatingRange());
    this.store$.select(selectUID)
      .pipe(
        filter(uid => !!uid),
        distinct()
      )
      .subscribe(uid => {
        // TODO Action
        this.store.dispatch({
          uid,
          type: 'Set uid',
        });
      });
    return;
  }
}
