import {createFeatureSelector, createSelector} from '@ngrx/store';
import {FavoriteBoardsActions, FavoriteBoardsActionTypes} from './favorite-boards.actions';

export enum FavoriteBoardsDocumentStatus {
  NotLoaded = 'not_loaded',
  NotCreated = 'not_created',
  Created = 'created',
}

export interface State {
  loading: boolean;
  documentStatus: FavoriteBoardsDocumentStatus;
  favoriteBoards: number[];
  canUseFavorites: boolean;
}

export const initialState: State = {
  loading: false,
  documentStatus: FavoriteBoardsDocumentStatus.NotLoaded,
  favoriteBoards: [],
  canUseFavorites: false
};

export function reducer(
  state = initialState,
  action: FavoriteBoardsActions
): State {
  switch (action.type) {
    case FavoriteBoardsActionTypes.GetFavoriteBoards: {
      return {
        ...state,
        loading: true,
      };
    }

    case FavoriteBoardsActionTypes.GetFavoriteBoardsSuccess: {
      return {
        ...state,
        loading: false,
        favoriteBoards: [...action.payload.boardsIds]
      };
    }

    case FavoriteBoardsActionTypes.GetFavoriteBoardsError: {
      return {
        ...state,
        loading: false,
      };
    }

    case FavoriteBoardsActionTypes.UpdateFavoriteBoards: {
      return {
        ...state,
        loading: true,
      };
    }

    case FavoriteBoardsActionTypes.UpdateFavoriteBoardsSuccess: {
      return {
        ...state,
        loading: false,
        favoriteBoards: [...action.payload.boardsIds]
      };
    }

    case FavoriteBoardsActionTypes.UpdateFavoriteBoardsError: {
      return {
        ...state,
        loading: false,
      };
    }

    case FavoriteBoardsActionTypes.SetDocumentStatus: {
      return {
        ...state,
        documentStatus: action.payload.documentStatus
      };
    }

    case FavoriteBoardsActionTypes.GiveAccessFavoriteBoards: {
      return {
        ...state,
        canUseFavorites: true
      };
    }

    case FavoriteBoardsActionTypes.RestrictAccessFavoriteBoards: {
      return {
        ...state,
        canUseFavorites: false
      };
    }

    case FavoriteBoardsActionTypes.ResetFavoriteBoards: {
      return {
        ...state,
        documentStatus: initialState.documentStatus,
        favoriteBoards: initialState.favoriteBoards,
      };
    }

    default: {
      return state;
    }
  }
}

export const selectFavoriteBoardsStore = createFeatureSelector<State>('favorite-boards');

export const selectFavoriteBoardsIds = createSelector(selectFavoriteBoardsStore, ({ favoriteBoards }) => favoriteBoards);

export const selectFavoriteBoardsIsLoading = createSelector(selectFavoriteBoardsStore, ({ loading }) => loading);

export const selectCanUseFavorites = createSelector(selectFavoriteBoardsStore, ({ canUseFavorites }) => canUseFavorites);
