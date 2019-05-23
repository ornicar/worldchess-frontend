import { Action } from '@ngrx/store';
import { IMediaFile, IMediaBlock } from './media-files.model';

export enum MediaFilesActionTypes {
  GetNextMediaFilesFromBlock = '[MediaFile] Get Next Page of Media Files From Block',
  AddMediaFilesToBlock = '[MediaFile] Get Media Files To Block',
  GetMediaBlocksByTournamentId = '[MediaBlock] Get Media Blocks by tournament id',
  LoadMediaBlocks = '[MediaBlock] Load Media Block',
  GetMediaFilesFromAllBlock = '[MediaFile] Get Next Pages of Media Files From All Blocks',
  ClearAllMedia = '[MediaFile] clear all media files',
  GetCoverPhotos = '[MediaFile] Get main photo',
  SetCoverPhotos = '[MediaFile] Set main photo'
}

export class GetMediaFilesFromBlock implements Action {
  readonly type = MediaFilesActionTypes.GetNextMediaFilesFromBlock;

  constructor(public payload: { offset: string, limit: string, block_id: string }) {}
}

export class GetMediaFilesFromAllBlocks implements Action {
  readonly type = MediaFilesActionTypes.GetMediaFilesFromAllBlock;

  constructor(public payload: { offsetsList: {[id: string]: string}, limit: string, block_ids: string[] }) {}
}

export class AddMediaFilesToBlock implements Action {
  readonly type = MediaFilesActionTypes.AddMediaFilesToBlock;

  constructor(public payload: { block_id: string, mediaFiles: IMediaFile[], count: number }) {}
}

export class GetMediaBlocksByTournamentId implements Action {
  readonly type = MediaFilesActionTypes.GetMediaBlocksByTournamentId;

  constructor(public payload: { tournament_id: string }) {}
}

export class LoadMediaBlocks implements Action {
  readonly type = MediaFilesActionTypes.LoadMediaBlocks;

  constructor(public payload: { mediaBlocks: IMediaBlock[] }) {}
}


export class ClearAllMedia implements Action {
  readonly type = MediaFilesActionTypes.ClearAllMedia;

  constructor() {}
}

export class GetCoverPhotos implements Action {
  readonly type = MediaFilesActionTypes.GetCoverPhotos;

  constructor() {}
}

export class SetCoverPhotos implements Action {
  readonly type = MediaFilesActionTypes.SetCoverPhotos;

  constructor( public payload: { mediaFiles: IMediaFile[] }) {}
}

export type MediaFileActions =
 GetMediaFilesFromBlock
 | AddMediaFilesToBlock
 | GetMediaBlocksByTournamentId
 | LoadMediaBlocks
 | GetMediaFilesFromAllBlocks
 | ClearAllMedia
 | GetCoverPhotos
 | SetCoverPhotos;
