import * as $ from 'jquery';
import 'slick-carousel';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-premium-features',
  templateUrl: './premium-features.component.html',
  styleUrls: ['./premium-features.component.scss']
})
export class PremiumFeaturesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $('.slider-paygate-features-images').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: true,
      arrows: false,
      asNavFor: '.slider-paygate-features-descriptions'
    });

    $('.slider-paygate-features-descriptions').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: false,
      arrows: false,
      fade: true,
      asNavFor: '.slider-paygate-features-images'
    });
  }

}
