import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {IPaginationResponse} from "@app/modules/main/model/common";
import {PinnedNews} from "@app/modules/main/model/pinned-news";
import {IPaginationParams} from "@app/broadcast/chess-footer/team-players/team-players-resource.service";
import {map} from "rxjs/operators";
import {PinnedNewsRequest} from "@app/modules/main/model/pinned-news.request";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PinnedNewsService {

  constructor(private  http: HttpClient) {
  }

  public getPinnedNews(request: PinnedNewsRequest) {
    let params = new HttpParams();
    params = params.set('news_type', `${request.news_type}`);

    if (typeof request.limit === 'number') {
      params = params.set('limit', `${request.limit}`);
    }
    if (typeof request.offset === 'number') {
      params = params.set('offset', `${request.offset}`);
    }
    return this.http.get<IPaginationResponse<PinnedNews>>(`${environment.endpoint}/pinned-news`, {params})
      .pipe(map(response => response.results.filter(v => v.news_type === request.news_type)));
  }
}
