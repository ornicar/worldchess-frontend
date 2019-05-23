import {UserNotificationSocketMessages} from '../auth/auth.model';

export interface IUserNotificationMessage {
  id: number;
  created: string;
  data: UserNotificationSocketMessages;
  read: boolean;
}
