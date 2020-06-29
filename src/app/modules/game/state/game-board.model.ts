import { BoardStatus } from '@app/broadcast/core/board/board.model';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { IGameMove } from './game-move.model';

export interface IGameBoard {
  id: string;
  board_id?: string;
  chat_id?: number;
  jwt: string;
  white_player: IPlayer;
  black_player: IPlayer;
  moves: IGameMove[];
  status?: BoardStatus;
}
