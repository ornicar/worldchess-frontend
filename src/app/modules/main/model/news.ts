import * as moment from "moment";

export interface NewsDto {
    id?: number;
    title?: string;
    preview?: string;
    content?: string;
    featured_image?: string;
    video_link?: string
    slug?: string
    pub_date?: string
}

export interface News {
  id: number;
  title: string;
  preview: string;
  content: string;
  featured_image: string;
  video_link: string
  slug: string
  pub_date: moment.Moment
}
