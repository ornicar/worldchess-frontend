import { IGameBoard } from './game-board.model';
import { ActionSource } from './action-source.enum';
import { IGameMove } from './game-move.model';
import { ChessColors } from '../chess-board/chess-board.component';
import { IPlayer } from '../../../app/broadcast/core/player/player.model';
import { Result } from '../../../app/broadcast/core/result/result.model';
import { EndReason } from './game-result-enum';
import { IAccount } from '../../account/account-store/account.model';
import { GameSocketMessagesHistoryDirections } from './game-socket-messages-history.model';
import { IGameMessage } from './game-socket-message.models';
import { SocketStatus } from '../../../app/shared/socket/socket-connection';
import { ITimeControl } from '@app/broadcast/core/tour/tour.model';

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
  ) { }
}

export class SetPlayerColor {
  static readonly type = '[GameSate] Set player color';
  constructor(
    public color: ChessColors,
    public source: ActionSource = ActionSource.WEBSOCKET,
  ) { }
}

export class RequestOpponent {
  static readonly type = '[GameSate] Request opponent';
}

export class RejectOpponentRequest {
  static readonly type = '[GameSate] Reject opponent request';
}

export class SubscribeToBoard {
  static readonly type = '[GameSate] Subscribe to board';
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

export class Draw {
  static readonly type = '[GameSate] User call to draw';
}


export class SetPlayer {
  static readonly type = '[GameSate] Set player';
  constructor(
    public player: IPlayer,
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
}


export class SetGameResult {
  static readonly type = '[GameSate] Set game result';
  constructor(
    public result: Result,
    public reason: EndReason,
  ) { }
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

export class SetAccount {
  static readonly type = '[GameSate] Set authorized account';
  constructor(
    public account: IAccount,
  ) {}
}

export class SetPgnUrl {
  static readonly type = '[GameSate] Set pgn url';
  constructor(
    public pgnUrl: string,
    public board_id: string,
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

export class CallAnArbiter {
  static readonly type = '[GameSate] Call and arbiter';
}

export class AbortGame {
  static readonly type = '[GameSate] Abort game';
}
