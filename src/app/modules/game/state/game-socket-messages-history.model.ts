import { IGameMessage } from './game-socket-message.models';
import { SocketStatus } from '@app/shared/socket/socket-connection';

export enum GameSocketMessagesHistoryDirections {
    INCOMING = 'INCOMING',
    OUTGOUING = 'OUTGOUING',
    STATUS = 'STATUS',
}

export interface IGameSocketMessagesHistory {
    type: GameSocketMessagesHistoryDirections;
    date: Date;
    message: IGameMessage | SocketStatus;
}
