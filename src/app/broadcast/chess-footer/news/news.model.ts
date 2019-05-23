import { IImagePreset } from '../../../shared/interfaces/media';

export interface INews {
  id: number;
  title: string;
  timestamp: string;
  tags: Array<{ id: number; name: string}>;
  image?: IImagePreset;
  author: IAuthor;
  topic: Array<{ id: number; name: string}>;
  content: string;
  tournament_name?: string;
  is_published: boolean;
}

export interface IAuthor {
  avatar: IImagePreset;
  name: string;
}

