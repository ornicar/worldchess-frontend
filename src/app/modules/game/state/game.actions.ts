import { IAccountGameBoardStyle, IAccountGameLastMove, IAccountLegalMove } from './../../../account/account-store/account.model';
import { IGameBoard } from './game-board.model';
import { ActionSource } from './action-source.enum';
import { IGameMove } from './game-move.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { Result } from '@app/broadcast/core/result/result.model';
import { EndReason } from './game-result-enum';
import { IAccount, IAccountRating } from '@app/account/account-store/account.model';
import { GameSocketMessagesHistoryDirections } from './game-socket-messages-history.model';
import { IGameMessage } from './game-socket-message.models';
import { SocketStatus } from '@app/shared/socket/socket-connection';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { TypeOfBug } from '@app/modal-windows/bug-report-window/type-of-bug.enum';
import { CheckmateState, TFigure } from '@app/shared/widgets/chessground/figure.model';
import { ChessColors } from '@app/modules/game/state/game-chess-colors.model';
import { IOnlineRating, OpponentMode, StartType } from '@app/modules/game/state/game.state';
import { EOppMode } from '@app/modules/game/state/online-request-response.model';
import { TimeLimitWarningType } from '@app/modules/game/state/game.model';

export class AddNewMove {
  static readonly type = '[GameState] Add new move';
  constructor(
    public move: IGameMove,
    public source: ActionSource = ActionSource.USER,
    ) { }
}

export class AddGameBoard {
  static readonly type = '[GameSate] Add board';
  constructor(
    public board: IGameBoard,
    public source: ActionSource = ActionSource.WEBSOCKET,
  ) {
    if (this.board.board_id && !this.board.id) {
      this.board.id = this.board.board_id;
    }

    if (!this.board.moves) {
      this.board.moves = [];
    }
  }
}

export class AddTournamentGameBoard {
  static readonly type = '[GameSate] Add tournament board';
  constructor(
    public board: IGameBoard,
    public source: ActionSource = ActionSource.WEBSOCKET,
  ) {
    if (this.board.board_id && !this.board.id) {
      this.board.id = this.board.board_id;
    }

    if (!this.board.moves) {
      this.board.moves = [];
    }
  }
}

export class GameBoardCreated {
  static readonly type = '[GameSate] Board created';
  constructor(
    public boardId: string,
    public jwt?: string,
    public whitePlayerUid?: string,
    public source: ActionSource = ActionSource.WEBSOCKET
  ) { }
}

export class SetPlayerColor {
  static readonly type = '[GameSate] Set player color';
  constructor(
    public color: ChessColors,
    public source: ActionSource = ActionSource.WEBSOCKET,
  ) { }
}

export class ClearOnlineRequestStatus {
  static readonly type = '[GameSate] Clear status of online request';
  constructor() { }
}

export class RequestOpponent {
  static readonly type = '[GameSate] Request opponent';
  constructor(
    public oppUID?: string,
  ) { }
}

export class RequestInvite {
  static readonly type = '[GameSate] Request friend invite';
  constructor(
    public invite: string,
    public oppMode: EOppMode,
  ) {
  }
}

export class SetInviteCode {
  static readonly type = '[GameState] Set invite code';
  constructor(
    public opponentMode: OpponentMode,
    public inviteCode: string,
    public requestOpponentUID: string,
  ) { }
}

export class SetChatId {
  static readonly type = '[GameState] Set chat Id';
  constructor(
    public chatId: string,
  ) {}
}

export class SetShowChat {
  static readonly type = '[GameState] Set chat show';
  constructor(
    public isShow: boolean,
  ) {}
}

export class UpdateTourJWT {
  static readonly type = '[GameState] Update tour JWT';
  constructor(
    public jwt: string,
  ) {}
}

export class SetNewMessage {
  static readonly type = '[GameState] Set new message';
  constructor(
    public id: number,
    public userId: number,
    public isNew: boolean,
    public isChat: boolean,
    public isFirst?: boolean,
  ) {}
}

export class SetDefaultNewMessage {
  static readonly type = '[GameState] Set default new message';
  constructor() {}
}

export class SetTimerInitializedInMoves {
  static readonly type = '[GameState] Set flag of timer initialization by moves notification';
  constructor(
    public flag: boolean
  ) {}
}

export class RejectOpponentRequest {
  static readonly type = '[GameSate] Reject opponent request';
}

export class RejectOpponentRequestLast {
  static readonly type = '[GameSate] Reject last opponent request';
}

export class ResetRematch {
  static readonly type = '[GameSate] Reset rematch';
}

export class InviteCancelRequest {
  static readonly type = '[GameSate] Cancel invite';
}

export class SubscribeToBoard {
  static readonly type = '[GameSate] Subscribe to board';
  constructor(
    public jwt?: string,
  ) {}
}

export class SetBoardSubscribed {
  static readonly type = '[GameSate] Set board subscribed flag';
  constructor(
    public flag: boolean,
  ) {}
}

export class GameReady {
  static readonly type = '[GameSate] Game ready';
}

export class SelectMove {
  static readonly type = '[GameSate] Select move on history panel';
  constructor(
    public move: IGameMove,
  ) { }
}

export class Resign {
  static readonly type = '[GameSate] User call to resignation';
}

export class GameError {
  static readonly type = '[GameSate] error';
  constructor(
    public text: string,
  ) {
  }
}

export class InitRatingRange {
  static readonly type = '[GameSate] Init rating range';
  constructor(
  ) {}
}

export class Draw {
  static readonly type = '[GameSate] User call to draw';
}

export class CancelDraw {
  static readonly type = '[GameSate] User cancel draw offer';
}

export class SetPlayer {
  static readonly type = '[GameSate] Set player';
  constructor(
    public player: IPlayer,
  ) { }
}

export class DownloadPGN {
  static readonly type = '[GameSate] Download PGN';
  constructor(
    public pgnUrl?: string,
    public pgnName?: string
  ) { }
}

export class SetOpponent {
  static readonly type = '[GameSate] Set opponent';
  constructor(
    public opponent: IPlayer,
  ) { }
}

export class RestartGame {
  static readonly type = '[GameSate] Restart game';
  constructor(
    public fixedValue?: boolean,
  ) { }
}


export class SetGameResult {
  static readonly type = '[GameSate] Set game result';
  constructor(
    public result: Result,
    public reason: EndReason,
  ) { }
}

export class ClearGameResult {
  static readonly type = '[GameSate] Set clear game result';
  constructor() { }
}

export class SetGameReady {
  static  readonly  type = '[GameSate] Set flag gameReady';
  constructor(
    public isGame: boolean,
  ) {
  }
}

export class OpponentOfferADraw {
  static readonly type = '[GameSate] Opponent offer a draw';
  constructor(
    public offer: boolean,
  ) { }
}

export class SetRatingChange {
  static readonly type = '[GameSate] Set game rating change';
  constructor(
    public rating: number = 0,
    public userUID: string = '',
    public boardID: string = ''
  ) { }
}

export class EmptyEndReason {
  static readonly type = '[GameSate] Set empty of endReason';
}

export class SetPlayerTimer {
  static readonly type = '[GameSate] Set player timer';
  constructor(
    public timer: number = 0,
  ) { }
}

export class SetOpponentTimer {
  static readonly type = '[GameSate] Set opponent timer';
  constructor(
    public timer: number = 0,
  ) { }
}
export class ShowGameResult {
  constructor(
    public show = true,
  ) {}
  static readonly type = '[GameSate] Show game result';
}

export class SetNotification {
  static readonly type = '[GameSate] Set game notification';
  constructor(
    public notification: string
  ) {}
}

export class SetTimeLimitNotification {
  static readonly type = '[GameSate] Set time limit notification';
  constructor(
    public notification: TimeLimitWarningType,
    public playerUid?: string
  ) {}
}

export class SetAccount {
  static readonly type = '[GameSate] Set authorized account';
  constructor(
    public account: IAccount,
  ) {}
}

export class SetAccountRating {
  static readonly type = '[GameSate] Set authorized account rating';
  constructor(
    public accountRating: IAccountRating,
  ) {}
}

export class SetPgnUrl {
  static readonly type = '[GameSate] Set pgn url';
  constructor(
    public pgnUrl: string,
    public board_id: string,
    public pgn_download_name: string
  ) {}
}

export class SocketMessage {
  static readonly type = 'Socket message';
  constructor(
    public type: GameSocketMessagesHistoryDirections,
    public message: IGameMessage | SocketStatus,
    public date = new Date(),
  ) {}
}

export class SendBugReport {
  static readonly type = '[GameSate] Send bug report';
  constructor(
    public report: string,
    public type: TypeOfBug,
    public email: string,
  ) {}
}

export class GetTimeControls {
  static readonly type = '[GameSate] Get time controls';
}

export class SetTimeControls {
  static readonly type = '[GameSate] Set time controls';
  constructor(
    public timeControls: ITimeControl[],
  ) {}
}

export class SetSelectedTimeControl {
  static readonly type = '[GameSate] Set selected time control';
  constructor(
    public timeControl: ITimeControl,
  ) {}
}

export class SetSelectedRatingMode {
  static readonly type = '[GameSate] Set selected game rating mode';
  constructor(
    public gameRatingMode: GameRatingMode,
  ) {}
}

export class SetReplayNotification {
  static readonly  type = '[GameSate] set replay notification';
  constructor(
    public notification: string,
  ) {
  }
}

export class SetSelectedTimeControlRatingMode {
  static readonly type = '[GameSate] Set selected time control and game rating mode';
  constructor(
    public timeControl: ITimeControl,
    public gameRatingMode: GameRatingMode
  ) {}
}

export class SetOpponentMode {
  static readonly type = '[GameSate] Set opponent mode';
  constructor(
    public opponentMode: OpponentMode
  ) {}
}

export class SetFlagReplay {
  static  readonly type = '[GameSate] Set flag of replay';
  constructor(
    public isReplay: boolean
  ) {
  }
}

export class SetFlagRematch {
  static readonly type = '[GameSate] Set flag of rematch';
  constructor(
    public isRematch: boolean
  ) {
  }
}

export class SetRematchInvite {
  static readonly type = '[GameSate] Set invite of rematch';
  constructor(
    public rematchInvite: string
  ) {
  }
}

export class CallAnArbiter {
  static readonly type = '[GameSate] Call and arbiter';
}

export class AbortGame {
  static readonly type = '[GameSate] Abort game';
}

export class SetCancelInvite {
  static  readonly  type = '[GameSate] Set flag of cancel invite';
  constructor(
    public isCancel: boolean,
  ) {}
}

export class SetCapturedByBlack {
  static readonly type = '[GameSate] Set figures are captured by black player';
  constructor(
    public figures: TFigure[],
  ) {}
}

export class SetCapturedByWhite {
  static readonly type = '[GameSate] Set figures are captured by white player';
  constructor(
    public figures: TFigure[],
  ) {}
}

export class SetCheck {
  static readonly type = '[GameSate] Set flag of Check';
  constructor(
    public isCheck: boolean,
  ) {}
}

export class SetCheckmate {
  static readonly type = '[GameSate] Set flag of Checkmate';
  constructor(
    public checkmateState: CheckmateState,
  ) {}
}

export class SetCheckmateReview {
  static readonly type = '[GameSate] Set flag of Checkmate in Review mode';
  constructor(
    public checkmateState: CheckmateState,
  ) {}
}

export class SetForce {
  static readonly type = '[GameSate] Set force of players';
  constructor(
    public whiteForce: number,
    public blackForce: number,
  ) {}
}

export class SetPromotionPopupVisible {
  static readonly type = '[GameSate] Set flag of promotion popup visibility';
  constructor(
    public promotionPopupVisibile: boolean,
  ) {}
}

export class SetGameMenuVisible {
  static readonly type = '[GameSate] Set flag of game menu visibility';
  constructor(
    public gameMenuVisibile: boolean,
  ) {}
}

export class FlipBoard {
  static readonly type = '[GameSate] Flip board';
  constructor(
    public boardIsFlipped: boolean,
  ) {
  }
}

export class SetGameSettings {
  static readonly type = '[GameSate] Set settings of game';
  constructor(
    public board_style: IAccountGameBoardStyle,
    public board_last_move_style: IAccountGameLastMove,
    public board_legal_move_style: IAccountLegalMove,
    public is_sound_enabled: boolean
  ) {}
}

export class SetBugReportModalOpened {
  static readonly type = '[GameSate] Set flag of bug report modal opened';
  constructor(
    public bugReportModalOpened: boolean,
  ) {
  }
}

export class UpdateFinalTimer {
  static readonly type = '[GameSate] Set flag of final timer update';
  constructor() {}
}

export class SetStartOnlineRatingRange {
  static readonly type = '[GameSate] Set start index of online rating range';
  constructor(
    public index: number,
  ) {
  }
}

export class SetWidthOnlineRatingRange {
  static readonly type = '[GameSate] Set width of online rating range';

  constructor(
    public width: number,
  ) {
  }
}

export class SetLeftExpandingRatingRange {
  static readonly type = '[GameSate] Move left end of range with fixed right end of range';
  constructor(
    public index: number,
  ) {
  }
}

export class SetOnlineRatings {
  static readonly type = '[GameSate] Set online ratings';
  constructor(
    public onlineRatings: IOnlineRating[],
  ) {
  }
}

export class GetOnlineRatings {
  static readonly type = '[GameSate] Get online ratings';
  constructor(
  ) {
  }
}

export class TourBoardReady {
  static readonly type = '[GameState] Set tour board ready info';
  constructor(
    public board: IGameBoard,
  ) {
  }
}

export class SetQuickstartFlag {
  static readonly type = '[GameSate] Set quickstart flag';
  constructor(
    public startType: StartType
  ) {
  }
}

export class ResetQuickstartFlag {
  static readonly type = '[GameSate] Reset quickstart flag';
  constructor(
  ) {
  }
}

export class SetConnectionActive {
  static readonly type = '[GameSate] Set connection activity flag';
  constructor(
    public flag: boolean
  ) {
  }
}
