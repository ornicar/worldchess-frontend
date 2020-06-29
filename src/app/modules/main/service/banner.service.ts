import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Banner, BannerDto, BannerImagesDto, BannerOrientation, BannerResponse} from "@app/modules/main/model/banner";
import {catchError, map} from "rxjs/operators";
import {of} from "rxjs";
import {Image} from "@app/modules/main/model/image";

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(private http: HttpClient) {
  }

  toImage = (bannerImageDto: BannerImagesDto): Image => {
    if (!bannerImageDto) {
      return {
        full: "",
        medium: "",
      }
    }
    return {
      full: bannerImageDto.full,
      medium: bannerImageDto.medium,
    }
  }


  private toBanner(dto: BannerDto) {
    const res: Banner = {
      news_id: dto.news_id || NaN,
      title: dto.title || '',
      image: this.toImage(dto && dto.image),
      link_text: dto.link_text || '',
      link_url: dto.link_url || '',
      banner_type: dto.banner_type,
      image_orientation: dto.image_orientation || BannerOrientation.portrait,
      preview: dto.preview || '',
      video: dto.video || '',
      pub_datetime: dto.pub_datetime || '',
      slug: dto.slug || '',
      extra_image_1: this.toImage(dto && dto.extra_image_1),
      extra_image_2: this.toImage(dto && dto.extra_image_2),
      price:  dto && dto.price ? `${dto.price}` : '',
      description:  dto && dto.description || '',
    };
    return res;
  }

  public getBanners() {
    return this.http.get<BannerResponse>(`${environment.endpoint}/banner`)
      .pipe(map(
        val => {
          const res = new Map<string, Banner>();
          Object.entries(val || {}).forEach(entry => {
            res.set(entry[0], this.toBanner(entry[1]))
          })
          return res;
        }
        )
      ).pipe(catchError(error => of(new Map<string, Banner>())))
  }
}
