import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {BoardResourceService} from '../broadcast/core/board/board-resource.service';
import {IBoard, IBoardWithExpandAll} from '../broadcast/core/board/board.model';
import {IPlayer} from '../broadcast/core/player/player.model';
import {IMove} from '../broadcast/move/move.model';

@Injectable()
export class GamingResourceService {

  constructor(
    private http: HttpClient,
    private boardResource: BoardResourceService
  ) { }

  readyPlay(board_id: number): Observable<{players: IPlayer[], board: IBoard}> {
    return this.http.post<IBoardWithExpandAll>(`${environment.endpoint}/boards/${board_id}/ready/`, null).pipe(
      map(this.boardResource.expandBoard)
    );
  }

  nextMove(board_id: number, san: string): Observable<IMove> {
    return this.http.post<IMove>(`${environment.endpoint}/boards/${board_id}/create_next_move/`, {san});
  }
}
