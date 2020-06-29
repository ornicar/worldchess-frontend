import {Injectable} from '@angular/core';
import {BehaviorSubject, interval, Observable} from "rxjs";
import {NewsShort} from "@app/modules/main/model/news-short";
import {catchError, map, timeout} from "rxjs/operators";
import {HttpClient, HttpClientModule, HttpParams} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {NewsDto, News} from "@app/modules/main/model/news";
import moment = require("moment");
import {IPaginationResponse} from "@app/modules/main/model/common";

@Injectable()
export class NewsServiceService {

  constructor(private http: HttpClient) {
  }

  getHeaderNews(): Observable<NewsShort> {
    return new BehaviorSubject<NewsShort>({
      imageSrc: "https://s3-wctour-ut-test.s3.amazonaws.com/media/mini_banner_images/7005182eaeec623a.png",
      time: "18:22",
      title: "Who are the Seconds in the Candidates"
    })
  }

  getLastNews(limit: number=10, offset: number=0): Observable<News[]> {
      let params = new HttpParams();
      params.set('limit', `${limit}`);
      params.set('offset', `${offset}`);
      return this.http.get<IPaginationResponse<NewsDto>>(`${environment.endpoint}/news`, {params})
         .pipe(map(
          news=>news.results.map(val=>({
            id: val.id || 0,
            title: val.title || '',
            preview: val.preview || '',
            content: val.content || '',
            slug: val.slug || '',
            featured_image: val.featured_image || 'https://s3-wctour-ut-test.s3.amazonaws.com/media/mini_banner_images/7005182eaeec623a.png',
            video_link: val.video_link || '',
            pub_date: val.video_link? moment(val.video_link): moment(0),
          }) as News).sort((a,b)=>a.pub_date.diff(a.pub_date, "ms"))));
  }
}
