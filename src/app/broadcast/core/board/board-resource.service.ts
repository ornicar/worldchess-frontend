import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IPlayer } from '../player/player.model';
import { IBoard, IBoardState, IBoardWithExpandAll } from './board.model';
import { Observable, of } from 'rxjs';

@Injectable()
export class BoardResourceService {

  constructor(private http: HttpClient) { }

  public expandBoard(boardExpanded: IBoardWithExpandAll): { players: IPlayer[], board: IBoard } {
    const white_player = boardExpanded.white_player;
    const black_player = boardExpanded.black_player;

    const players: IPlayer[] = [];

    if (white_player) {
      players.push(white_player);
    }

    if (black_player) {
      players.push(black_player);
    }

    const board = {
      ...boardExpanded,
      white_player: white_player ? white_player.fide_id : null,
      white_player_name: white_player ? white_player.full_name : boardExpanded.white_player_name,
      black_player: black_player ? black_player.fide_id : null,
      black_player_name: black_player ? black_player.full_name : boardExpanded.black_player_name,
    };

    return {
      players: players,
      board
    };
  }

  get(id: number) {
    return this.http.get<IBoard>(`${environment.endpoint}/boards/${id}/`);
  }

  getWithExpandAll(id: number): Observable<{players: IPlayer[], board: IBoard}> {
    return this.http.get<IBoardWithExpandAll>(`${environment.endpoint}/boards/${id}/?expand=white_player,black_player`)
      .pipe(map(this.expandBoard));
  }

  getByTourWithExpandAll(id: number): Observable<{players: IPlayer[], boards: IBoard[]}> {
    const params = new HttpParams().set('tour', id.toString());

    return this.http.get<IBoardWithExpandAll[]>(`${environment.endpoint}/boards/?expand=white_player,black_player`, { params })
      .pipe(map(boardsExpanded => boardsExpanded.reduce(
        (accumulator, boardExpanded) => {
          const {players, board} = this.expandBoard(boardExpanded);

          return {
            players: accumulator.players.concat(...players),
            boards: accumulator.boards.concat(board) // On BE some data is invalid.
          };
        },
        {
          players: [],
          boards: []
        }
      )));
  }

  getByTour(id: number): Observable<IBoard[]> {
    const params = new HttpParams().set('tour', id.toString());

    return this.http.get<IBoard[]>(`${environment.endpoint}/boards/`, { params });
  }

  getState(id: number) {
    return this.http.get<IBoardState>(`${environment.endpoint}/boards/${id}/state/`);
  }

  getAll() {
    return this.http.get<IBoard[]>(`${environment.endpoint}/boards/`);
  }

  getPgn(id: number) {
    // TODO: Uncomment real request after resolved back-end part
    // return this.http.get<IBoardPGN>(`${environment.endpoint}/boards/${id}/pgn/`);
    return of({
      id: id,
      pgn_file: {
        id: 3,
        file_name: null,
        file_path: 'https://worldchess-ut-test.s3.amazonaws.com/pgn_files/2018/09/13/open001007002.pgn?X-Amz-Algorithm=AWS4-HMAC' +
        '-SHA256&X-Amz-Credential=AKIAIF2TX76QVAJOZZCA%2F20180919%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20180919T133042Z' +
        '&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=aa7347f1077c860d0da1e819eec23c916794b02ef67fb4cdc8728e75a9' +
        'b7d365',
      }
    });
  }
}
