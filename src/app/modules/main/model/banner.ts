import {Image} from "@app/modules/main/model/image";

export interface BannerImagesDto {
  medium: string
  full: string
}

export enum BannerOrientation {
  landScape = 1,
  portrait = 2
}

export enum BannerType {
  video = "video", tournament="tournament", news="news", image="image"
}

export interface BannerDto {
  news_id?: number
  title?: string
  image?: BannerImagesDto,
  link_text?: string,
  link_url?: string,
  banner_type?:BannerType
  image_orientation? : BannerOrientation
  preview?: string
  video?: string
  pub_datetime?: string
  slug?: string
  description?: string
  extra_image_1?: BannerImagesDto,
  extra_image_2?: BannerImagesDto,
  price?: number
}

export type BannerResponse = {[key:string]:BannerDto}

export interface Banner {
  news_id:number
  title:string
  image: Image,
  link_text: string
  link_url: string
  banner_type: BannerType
  image_orientation: BannerOrientation
  preview: string
  video: string
  pub_datetime: string
  slug: string
  extra_image_1?: Image,
  extra_image_2?: Image,
  price: string
  description: string
}
