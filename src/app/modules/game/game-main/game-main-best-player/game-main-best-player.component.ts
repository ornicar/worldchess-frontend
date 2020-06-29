import { Component, OnInit } from '@angular/core';
import {PlayerRatingResourceService} from "@app/modules/app-common/services/player-rating-resource.service";
import {IPlayerCompetitors, IPlayerRatingProfile} from "@app/modules/app-common/services/player-rating.model";
import {BehaviorSubject, Observable, of, Subject} from "rxjs";
import {CountryResourceService} from "@app/broadcast/core/country/country-resource.service";
import {count} from "rxjs/operators";
import {GamePlayerRatingService} from "@app/modules/game/service/game-player-rating-service";
import { AccountService } from '@app/account/account-store/account.service';

@Component({
  selector: 'game-main-best-player',
  templateUrl: './game-main-best-player.component.html',
  styleUrls: ['./game-main-best-player.component.scss']
})
export class GameMainBestPlayerComponent implements OnInit {

  constructor(gamePlayerRatingService: GamePlayerRatingService,
              countryService: CountryResourceService,
              public accountService: AccountService) {
    this.playerRatingResourceService = gamePlayerRatingService;
  }

  private countryService: CountryResourceService;
  private playerRatingResourceService:PlayerRatingResourceService;


  bestPlayer$:Observable<IPlayerCompetitors>;

  avatar$:Subject<string> = new  BehaviorSubject("");
  fullName$:Subject<string> = new BehaviorSubject("");
  age$:Subject<string> = new BehaviorSubject("");
  country$:Subject<number> = new BehaviorSubject(0);
  worldchess_blitz$:Subject<string> = new BehaviorSubject("");
  worldchess_bullet$:Subject<string> = new BehaviorSubject("");
  worldchess_rapid$  :Subject<string> = new BehaviorSubject("");

  ngOnInit() {
    this.bestPlayer$ = this.playerRatingResourceService.getBestPlayer();
    this.bestPlayer$.subscribe(player=> {
      if (player) {
        this.avatar$.next( player.profile && player.profile.avatar && player.profile.avatar.full || '');
        this.fullName$.next( player.profile && player.profile.full_name || 'Reef Cardenier');
        this.age$.next(player.profile && player.profile.birth_date || '');
        this.worldchess_blitz$.next(`${player.profile && player.worldchess_blitz || ''}`);
        this.worldchess_bullet$.next(`${player.profile && player.worldchess_bullet || ''}`);
        this.worldchess_rapid$.next(`${player.profile && player.worldchess_rapid || ''}`);
        this.country$.next(player.profile && player.profile.country || 0)
      }
    })
  }
}
