import { IPlayer} from '../../../broadcast/core/player/player.model';
import { Tournament } from '../../../broadcast/core/tournament/tournament.model';
import { IImagePreset } from '../../../shared/interfaces/media';
import { MainPageActions, MainPageActionsTypes } from './main-page.actions';
import { IWidget } from '../../../../widget/app/services/widget.service';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export enum VideoType {
  Youtube = 0,
  Livestream = 1,
  Uploaded = 2
}

export interface IVideo {
  video_type: VideoType;
  url: string;
}

export enum BannerType {
  News = 'news',
  Shop = 'shop',
  Video = 'video',
  Widget = 'widget',
  Rating = 'rating',
  Tournament = 'tournament'
}

export interface Banner {
  banner_type: BannerType;
}

export interface ShopBanner extends Banner {
  banner_type: BannerType.Shop;
  title: string;
  image: IImagePreset;
  link_text: string;
  link_url: string;
}

export interface NewsBanner extends Banner {
  banner_type: BannerType.News;
  title: string;
  image: IImagePreset;
  link_text: string;
  news_id: number;
}

export interface VideoBanner extends Banner {
  banner_type: BannerType.Video;
  title: string;
  video: IVideo;
  link_text: string;
  link_url: string;
}

export interface WidgetBanner extends Banner {
  banner_type: BannerType.Widget;
  title: string;
  widget: IWidget['id'];
  link_text: string;
  link_url: string;
}

export interface RatingBanner extends Banner {
  banner_type: BannerType.Rating;
  title: string;
  image: IImagePreset;
  player: IPlayer; // @todo Fix it.
  link_text: string;
  link_url: string;
}

export interface TournamentBanner extends Banner {
  banner_type: BannerType.Tournament;
  title: string;
  image: IImagePreset;
  link_text: string;
  tournament: Tournament['id'];
}

export type mainBanner = NewsBanner | ShopBanner | VideoBanner | TournamentBanner | WidgetBanner;
export type miniBanner = NewsBanner | ShopBanner | RatingBanner | TournamentBanner;

export interface State {
  banner: mainBanner;
  mini_banner_1: miniBanner; // @todo fix it.
  mini_banner_2: miniBanner;
  mini_banner_3: miniBanner;
  loading: boolean;
}

export const initialState: State = {
  banner: null,
  mini_banner_1: null,
  mini_banner_2: null,
  mini_banner_3: null,
  loading: false,
};

export function reducer(state = initialState, action: MainPageActions): State {
  switch (action.type) {
    case MainPageActionsTypes.GetInfo:
      return {
        ...state,
        loading: true,
      };

    case MainPageActionsTypes.SetInfo:
      return {
        ...state,
        banner: action.payload.banner,
        mini_banner_1: action.payload.mini_banner_1,
        mini_banner_2: action.payload.mini_banner_2,
        mini_banner_3: action.payload.mini_banner_3,
        loading: false,
      };

    case MainPageActionsTypes.GetInfoError:
      return {
        ...state,
        banner: null,
        loading: false,
      };

    default:
      return state;
  }
}

export const selectMainPage = createFeatureSelector<State>('main-page');
export const selectMainPageBanner = createSelector(selectMainPage, ({ banner }) => banner);
export const selectMiniPageBanner1 = createSelector(selectMainPage, ({ mini_banner_1 }) => mini_banner_1);
export const selectMiniPageBanner2 = createSelector(selectMainPage, ({ mini_banner_2 }) => mini_banner_2);
export const selectMiniPageBanner3 = createSelector(selectMainPage, ({ mini_banner_3 }) => mini_banner_3);
