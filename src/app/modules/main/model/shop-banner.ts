import {Image} from "@app/modules/main/model/image";

export interface ShopBanner {
  banner_type: string,
  image: Image,
  extra_image_1: Image,
  extra_image_2: Image,
  title: string,
  description: string
  link_text: string,
  link_url: string,
  price: string
}
