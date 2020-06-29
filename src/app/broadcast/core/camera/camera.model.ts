export enum BroadcastingType {
  LIVESTREAM = 1,
  YOUTUBE = 2
}

export enum OperationMode {
  ONLINE = 1,
  OFFLINE = 2
}

export interface ICamera {
  id: number;
  name: string;
  tour: number;
  link_display: string;
  is_default: boolean;
}

export interface IFounderCamera {
  id: number;
  tour: number;
  name: string;
  link: string;
  is_default: boolean;
  operation_mode: OperationMode;
  broadcasting_type: BroadcastingType;
}
