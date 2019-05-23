import { Component, OnInit } from '@angular/core';

import * as $ from 'jquery';
import 'slick-carousel';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {
  constructor() { }

  ngOnInit() {
    $('.rating-wrapper').slick({
      infinite: false,
      slidesToShow: 3,
      slidesToScroll: 3,
      responsive: [
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 960,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 1080,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        }
      ]
    });
  }
}
