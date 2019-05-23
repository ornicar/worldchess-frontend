import {createFeatureSelector, createSelector} from '@ngrx/store';
import {GameActions, GameActionTypes, ChatInfoModalTypes} from './game.actions';

export interface State {
  premiumModal: {
    open: boolean;
  };
  embeddedWidgetModal: {
    open: boolean;
  };
  chatInfoModal: {
    open: boolean;
    detail: string;
    type: ChatInfoModalTypes;
  };
}

export const initialState: State = {
  premiumModal: {
    open: false
  },
  embeddedWidgetModal: {
    open: false,
  },
  chatInfoModal: {
    open: false,
    detail: null,
    type: null
  }
};

export function reducer(state = initialState, action: GameActions): State {
  switch (action.type) {

    case GameActionTypes.OpenPremiumModal:
      return state = {
        ...state,
        premiumModal: {
          open: true
        }
      };

    case GameActionTypes.ClosePremiumModal:
      return state = {
        ...state,
        premiumModal: {
          open: false
        }
      };

    case GameActionTypes.OpenEmbeddedWidgetModal:
      return state = {
        ...state,
        embeddedWidgetModal: {
          open: true
        }
      };

    case GameActionTypes.CloseEmbeddedWidgetModal:
      return state = {
        ...state,
        embeddedWidgetModal: {
          open: false
        }
      };

    case GameActionTypes.OpenChatInfoModal:
      return state = {
        ...state,
        chatInfoModal: {
          open: true,
          detail: action.payload.detail,
          type: action.payload.type
        }
      };

    case GameActionTypes.CloseChatInfoModal:
      return state = {
        ...state,
        chatInfoModal: {
          open: false,
          detail: null,
          type: null
        }
      };

    default:
      return state;
  }
}

export const selectGame = createFeatureSelector<State>('game');

export const selectPremiumModalIsOpen = createSelector(selectGame, ({ premiumModal: { open } }) => open);
export const selectEmbeddedWidgetModalIsOpen = createSelector(selectGame, ({ embeddedWidgetModal: { open } }) => open);

export const selectChatInfoModalIsOpen = createSelector(selectGame, ({ chatInfoModal: { open } }) => open);
export const selectChatInfoModalDetail = createSelector(selectGame, ({ chatInfoModal: { detail } }) => detail);
export const selectChatInfoModalType = createSelector(selectGame, ({ chatInfoModal: { type } }) => type);
