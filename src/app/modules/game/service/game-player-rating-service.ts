import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Store} from "@ngrx/store";
import * as fromRoot from "@app/reducers";
import {PlayerRatingResourceService} from "@app/modules/app-common/services/player-rating-resource.service";


@Injectable()
export class GamePlayerRatingService extends PlayerRatingResourceService {

  constructor(http: HttpClient,
              store$: Store<fromRoot.State>) {
    super(http, store$)
  }
}
