import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable ,  forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MediaFilesResourceService } from './media-files-resource.service';
import {
  GetMediaFilesFromBlock,
  MediaFilesActionTypes,
  AddMediaFilesToBlock,
  GetMediaBlocksByTournamentId,
  LoadMediaBlocks,
  GetMediaFilesFromAllBlocks,
  SetCoverPhotos,
  GetCoverPhotos,
} from './media-files.actions';

@Injectable()
export class MediaFileEffects {

  constructor(
    private actions$: Actions,
    private mediaFilesResource: MediaFilesResourceService) { }

  @Effect()
  getMediaFilesFromBlock$: Observable<Action> = this.actions$.pipe(
    ofType<GetMediaFilesFromBlock>(MediaFilesActionTypes.GetNextMediaFilesFromBlock),
    switchMap((action) => {
      const { block_id, limit, offset } = action.payload;
      const newParams = { block_id, limit, offset };
      return this.mediaFilesResource
        .getMediaWithParams(newParams)
        .pipe(map(mediaResponse => {
          const { results, count } = mediaResponse;
          return new AddMediaFilesToBlock({ mediaFiles: results, block_id, count });
        }));
    })
  );

  @Effect()
  getMediaBlocks$: Observable<Action> = this.actions$.pipe(
    ofType<GetMediaBlocksByTournamentId>(MediaFilesActionTypes.GetMediaBlocksByTournamentId),
    switchMap((action) => {
      const { tournament_id } = action.payload;
      return this.mediaFilesResource
        .getBlocksByTournamentId(tournament_id).pipe(
          map(mediaBlocks => {
            return new LoadMediaBlocks({ mediaBlocks });
          })
        );
    })
  );

  @Effect()
  getMediaFilesFromAllBlocks$: Observable<Action> = this.actions$.pipe(
    ofType<GetMediaFilesFromAllBlocks>(MediaFilesActionTypes.GetMediaFilesFromAllBlock),
    switchMap((action) => {
      const { block_ids, limit, offsetsList } = action.payload;
      const requests = [];
      block_ids.map((block_id: string) => {
        requests.push(
          this.mediaFilesResource.getMediaWithParams({
            offset: offsetsList[block_id],
            block_id,
            limit
          })
        );
      });
      return forkJoin(requests).pipe(
        switchMap((responses) => responses.map((mediaResponse: { results: any[], count: number }, idx) => {
          const { results, count } = mediaResponse;
          return new AddMediaFilesToBlock({ mediaFiles: results, block_id: block_ids[idx], count });
        }))
      );
    })
  );

  @Effect()
  getMainPhoto$: Observable<Action> = this.actions$.pipe(
    ofType<GetCoverPhotos>(MediaFilesActionTypes.GetCoverPhotos),
    switchMap((action) => {
      const limit = '20';
      const offset = '0';
      const newParams = { limit, offset, kind: 'cover' };
      return this.mediaFilesResource
        .getMediaWithParams(newParams)
        .pipe(map(mediaResponse => {
          const { results } = mediaResponse;
          return new SetCoverPhotos({ mediaFiles: results });
        }));
    })
  );
}


