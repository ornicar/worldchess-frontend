import { ITimeControl } from '../../../app/broadcast/core/tour/tour.model';

export interface IOnlineRequestResponse {
  created: string;
  player_uid: string;
  rating: number;
  uid: string;
  time_control: ITimeControl;
}
