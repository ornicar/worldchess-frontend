import {Component, OnInit} from '@angular/core';
import {PlayerRatingResourceService} from "@app/modules/app-common/services/player-rating-resource.service";
import {SetQuickstartFlag} from "@app/modules/game/state/game.actions";
import {StartType} from "@app/modules/game/state/game.state";
import {take} from "rxjs/operators";
import {Store} from "@ngxs/store";
import {Router} from "@angular/router";

@Component({
  selector: 'main-page-quick-game',
  templateUrl: './main-page-quick-game.component.html',
  styleUrls: ['./main-page-quick-game.component.scss']
})
export class MainPageQuickGameComponent implements OnInit {

  constructor(private playerRatingResourceService: PlayerRatingResourceService,
              private store: Store,
              private router: Router) {
  }

  ngOnInit() {
  }

  quickStart(e:MouseEvent) {
    this.store.dispatch(new SetQuickstartFlag(StartType.Quickstart)).pipe(take(1)).subscribe(v => {
      this.router.navigate(['/singlegames'])
    })
  }
}
