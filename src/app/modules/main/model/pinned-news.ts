export enum LayoutType {
  LAYOUT_1=1, LAYOUT_2=2, LAYOUT_3=3,
}

export enum NewsType {
  NEWS_BANNER=1, MAIN_BANNER =2, SMALL_NEWS_BANNER = 3,TOURNAMENT_NEWS_BANNER = 4,
}

export interface PinnedNews {
  id: number
  title: string,
  preview: string,
  content: string,
  featured_image: string,
  main_banner_image: string,
  small_banner_image: string,
  video_link: string,
  news_type: NewsType
  layout_type: LayoutType
  newsDate?: string
}
