import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MediaFileActions, MediaFilesActionTypes } from './media-files.actions';
import { IMediaFile, IMediaBlock } from './media-files.model';

export interface MediaListRecord {
  list: IMediaFile[];
  count: number;
}

export interface State extends EntityState<IMediaBlock> {
  media: { [block_id: number]: MediaListRecord };
  selectedMedia: IMediaFile;
  covers: IMediaFile[];
  loading: boolean;
}

export const adapter: EntityAdapter<IMediaBlock> = createEntityAdapter<IMediaBlock>();

export const initialState: State = adapter.getInitialState({
  media: {},
  selectedMedia: null,
  covers: [],
  loading: false
});

export function reducer(
  state = initialState,
  action: MediaFileActions
): State {
  switch (action.type) {
    case MediaFilesActionTypes.LoadMediaBlocks: {
      return {
        ...adapter.addAll(action.payload.mediaBlocks, state),
        loading: false
      };
    }

    case MediaFilesActionTypes.AddMediaFilesToBlock: {
      const { block_id, mediaFiles, count } = action.payload;
      const existedRecord = state.media[block_id];
      const list = existedRecord ? [...existedRecord.list, ...mediaFiles] : mediaFiles;

      const newMediaListRecord: MediaListRecord = {
        count,
        list
      };
      return {
        ...state, media: {
          ...state.media,
          [block_id]: newMediaListRecord
        }
      };
    }

    case MediaFilesActionTypes.ClearAllMedia: {
      return {
        ...state,
        media: {}
      };
    }

    case MediaFilesActionTypes.SetCoverPhotos: {
      return {
        ...state,
        covers: action.payload.mediaFiles
      };
    }

    case MediaFilesActionTypes.GetMediaBlocksByTournamentId: {
      return {
        ...state,
        loading: true
      };
    }

    default: {
      return state;
    }
  }
}

export const selectMediaFileState = createFeatureSelector<State>('mediaFiles');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectMediaFileState);

export const selectAllMedia = createSelector(selectMediaFileState, state => state.media);

export const selectAllCounts = createSelector(
  selectAllMedia,
  selectAll,
  (allMedia, allBlocks) => {
    const obj = {};
    if (allMedia) {
      allBlocks.forEach((block) => {
        if (!allMedia[block.id]) {
          return;
        }
        Object.assign(obj, { [block.id]: allMedia[block.id].count });
      });
      return obj;
    }
    return null;
  }
);

export const selectSelectedMedia = createSelector(selectMediaFileState, state => state.selectedMedia);

export const selectAllCovers = createSelector(selectMediaFileState, state => state.covers);

export const selectLoading = createSelector(selectMediaFileState, state => state.loading);
