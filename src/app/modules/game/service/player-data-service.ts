import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

export interface IPlayer {
  full_name?: string;
  nickname?: string;
  rating?: number;
  avatar?: {
    full?: string;
  }
  nationality_id?: number;
  fide_id?: number;
  rank?: string;
  uid?: string;
}

export interface IBarItem {
  boardId?: string;
  white_player?:IPlayer;
  black_player?:IPlayer;
  result?: number;
  player_status?: string;
}


@Injectable()
export class PlayerDataService {

  constructor(private http: HttpClient) {}

    getAll() {
      return this.http.get<IBarItem[]>(`${environment.endpoint}/online/best-boards/top_list/`);
    }

}
