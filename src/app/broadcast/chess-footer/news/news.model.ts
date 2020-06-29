import { IImagePreset } from '../../../shared/interfaces/media';

export interface INews {
  id: number;
  title: string;
  timestamp: string;
  tags: Array<{ id: number; name: string}>;
  image?: IImagePreset;
  author: IAuthor;
  topic: string;
  content: string;
  tournament_name?: string;
  slug: string;
}

export interface IAuthor {
  avatar?: IImagePreset;
  name: string;
}

