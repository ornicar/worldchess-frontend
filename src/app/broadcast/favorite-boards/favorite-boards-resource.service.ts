import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {IBoard} from '../core/board/board.model';
import {IFavoriteBoardsResponse} from './favorite-boards.model';

@Injectable()
export class FavoriteBoardsResourceService {

  constructor(private http: HttpClient) { }

  get() {
    return this.http.get<IFavoriteBoardsResponse>(`${environment.endpoint}/me/favorites/`);
  }

  create(boards: IBoard['id'][]) {
    return this.http.post<IFavoriteBoardsResponse>(`${environment.endpoint}/me/favorites/`, { boards: { all: boards} });
  }

  update(boards: IBoard['id'][]) {
    return this.http.patch<IFavoriteBoardsResponse>(`${environment.endpoint}/me/favorites/`, { boards: { all: boards} });
  }
}
