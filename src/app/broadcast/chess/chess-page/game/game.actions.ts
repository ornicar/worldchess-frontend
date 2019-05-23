import {Action} from '@ngrx/store';

export enum GameActionTypes {
  OpenPremiumModal = '[Game] Open premium modal',
  ClosePremiumModal = '[Game] Close premium modal',
  OpenEmbeddedWidgetModal = '[Game] Open wmbedded widget modal',
  CloseEmbeddedWidgetModal = '[Game] Close wmbedded widget modal',
  OpenChatInfoModal = '[Game] Open chat info modal',
  CloseChatInfoModal = '[Game] Close chat info modal',
}

export enum ChatInfoModalTypes {
  BANNED,
  RESTRICTED
}

export class GameOpenPremiumModal implements Action {
  readonly type = GameActionTypes.OpenPremiumModal;

  constructor() {}
}

export class GameClosePremiumModal implements Action {
  readonly type = GameActionTypes.ClosePremiumModal;

  constructor() {}
}

export class GameOpenEmbeddedWidgetModal implements Action {
  readonly type = GameActionTypes.OpenEmbeddedWidgetModal;

  constructor() {}
}

export class GameCloseEmbeddedWidgetModal implements Action {
  readonly type = GameActionTypes.CloseEmbeddedWidgetModal;

  constructor() {}
}

export class GameOpenChatInfoModal implements Action {
  readonly type = GameActionTypes.OpenChatInfoModal;

  constructor(public payload: { detail: string, type: ChatInfoModalTypes }) {}
}

export class GameCloseChatInfoModal implements Action {
  readonly type = GameActionTypes.CloseChatInfoModal;

  constructor() {}
}

export type GameActions =
  GameOpenPremiumModal
  | GameClosePremiumModal
  | GameOpenEmbeddedWidgetModal
  | GameCloseEmbeddedWidgetModal
  | GameOpenChatInfoModal
  | GameCloseChatInfoModal;
