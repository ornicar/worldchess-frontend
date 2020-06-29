import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { GameState } from '@app/modules/game/state/game.state';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';
import { ICountry } from '@app/broadcast/core/country/country.model';

@Component({
  selector: 'game-chat-player',
  templateUrl: './game-chat-player.component.html',
  styleUrls: ['./game-chat-player.component.scss']
})
export class GameChatPlayerComponent implements OnInit {

  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.isOpponentMove) isOppoenetMode$: Observable<boolean>;

  federation$ = this.player$.pipe(
      take(1),
      map(i => i.nationality_id),
      switchMap( (i) => this.countryResourceService.get(i)
        .pipe(
            map( (country: ICountry) => country ? country.long_code : '')
        ))
  );

  fullName: string;
  rating: number;

  constructor(
    private countryResourceService: CountryResourceService
  ) { }

  ngOnInit() {
    this.player$.subscribe( (player) => {
        this.fullName = player.full_name;
        this.rating = player.rating;
    });

  }

}
