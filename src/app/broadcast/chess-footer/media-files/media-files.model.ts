import {IImagePreset} from '../../../shared/interfaces/media';

export interface IMediaFile {
  id?: number;
  image: IImagePreset;
  caption: string;
  seq_num: number;
  kind: string;
  video_url: string;
  slug: string;
  block: number;
}

export interface IMediaBlock {
  id: number;
  title: string;
  datetime: string;
  description: string;
  tournament: number;
}
