import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IMediaFile, IMediaBlock } from './media-files.model';
import { Observable } from 'rxjs';

interface IMediaFileParams {
  block_id?: string;
  limit: string;
  offset: string;
  ordering?: string;
  kind?: string;
}

interface IMediaResponse {
  count: number;
  next?: string;
  previous?: string;
  results: IMediaFile[];
}
// @TODO make BaseResponse class depenging on entity type

@Injectable()
export class MediaFilesResourceService {

  constructor(private http: HttpClient) { }

  getMediaWithParams(queryParams?: IMediaFileParams): Observable<IMediaResponse> {
    const params = {};
    if (queryParams) { Object.assign(params, queryParams); }
    return this.http.get<IMediaResponse>(`${environment.endpoint}/mediafile/`, { params });
  }

  get(id: number): Observable<IMediaFile> {
    return this.http.get<IMediaFile>(`${environment.endpoint}/mediafile/${id}/`);
  }

  getBlocksByTournamentId(tournament_id: string): Observable<IMediaBlock[]> {
    const params = new HttpParams().set('tournament_id', tournament_id.toString()).set('ordering', 'datetime');
    return this.http.get<IMediaBlock[]>(`${environment.endpoint}/block/`, { params });
  }
}
