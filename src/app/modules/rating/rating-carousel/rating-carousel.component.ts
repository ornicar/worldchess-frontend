import { Component, ViewChild } from '@angular/core';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { PlayerRatingResourceService } from '@app/modules/app-common/services/player-rating-resource.service';
import { map } from 'rxjs/operators';
import { IPlayerRating } from '@app/modules/app-common/services/player-rating.model';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export interface ICarouselRatingItem {
  photo: string;
  country: string;
  name: string;
  sex: string;
  year: string;
}

@Component({
  selector: 'app-rating-carousel',
  templateUrl: './rating-carousel.component.html',
  styleUrls: ['./rating-carousel.component.scss'],
})

export class RatingCarouselComponent {

  public carouselRating: NguCarouselConfig = {
    grid: { xs: 1, sm: 2, md: 3, lg: 3, all: 0 },
    touch: true,
    loop: false,
    point: { visible: false },
  };

  players$: Observable<Array<IPlayerRating & {name: string}>> = this.ratingResource.getAll('rank', 9).pipe(
    map(players => {
      const result = players.slice(0, 9).map(player => {
        return {
          ... player,
          name: player.full_name.split(', ').reverse().join(' '),
        };
      }).sort((p1, p2) => p1.rank - p2.rank);

      result.push({
        fide_id: 0,
        rank: 0,
        full_name: '',
        birth_year: 0,
        rating: 0,
        blitz_rating: 0,
        rapid_rating: 0,
        avatar: '',
        portrait: '',
        labels: [],
        federation: 0,
        title: '',
        name: '',
      });
      return result;
    }),
  );

  @ViewChild('carousel', { static: false }) carousel: NguCarousel<ICarouselRatingItem>;

  constructor(
    private ratingResource: PlayerRatingResourceService,
    private router: Router,
  ) {
  }

  carouselMove() {
    if (this.carousel.isLast) {
      this.router.navigate(['/', 'ratings']).then();
    }
  }

}
