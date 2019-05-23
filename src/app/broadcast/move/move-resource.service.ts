import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {IMove} from './move.model';

@Injectable()
export class MoveResourceService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<IMove[]>(`${environment.endpoint}/moves/`);
  }

  getByBoard(board_id) {
    return this.http.get<IMove[]>(`${environment.endpoint}/boards/${board_id}/moves/`);
  }

  getLastByBoards(board_ids: number[]) {
    const params = new HttpParams().set('board_id', board_ids.join(','));

    return this.http.get<IMove[]>(`${environment.endpoint}/boards/moves/`, { params });
  }
}
