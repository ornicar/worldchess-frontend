import { AccountService } from './../../../../account/account-store/account.service';
import {Component, OnInit} from '@angular/core';
import {PlayerRatingResourceService} from "@app/modules/app-common/services/player-rating-resource.service";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {IPlayerCompetitors, IPlayerRatingProfile, IStats} from "@app/modules/app-common/services/player-rating.model";
import {GamePlayerRatingService} from "@app/modules/game/service/game-player-rating-service";
import moment = require("moment");

@Component({
  selector: 'game-main-all-time-chempion',
  templateUrl: './game-main-all-time-chempion.component.html',
  styleUrls: ['./game-main-all-time-chempion.component.scss']
})
export class GameMainAllTimeChempionComponent implements OnInit {

  constructor(
    private playerRatingResourceService: GamePlayerRatingService,
    public accountService: AccountService) {
  }


  profile$ = new BehaviorSubject<IPlayerRatingProfile>({});
  avatar$ = new BehaviorSubject<string>('');
  player$ = new BehaviorSubject<IPlayerCompetitors>({player_id: NaN, profile: {}})
  stat$ =  new BehaviorSubject<IStats>({})
  showBirthDate$ = new BehaviorSubject(false);
  ngOnInit() {
    this.playerRatingResourceService.getBest10Players('worldchess').subscribe(players => {
      const player = (players || [])[0];
      this.player$.next(player);
      this.profile$.next( player.profile || {})
      this.avatar$.next( player.profile && player.profile.avatar && player.profile.avatar.full || '')
      this.playerRatingResourceService.getPlayerGeneralStat(player.player_id).subscribe(playerStat=>{
        this.stat$.next(playerStat.stats || {})
      })
      this.showBirthDate$.next(!!(player.profile.birth_date &&  moment(player.profile.birth_date).year()>1900))
    });
  }

}
