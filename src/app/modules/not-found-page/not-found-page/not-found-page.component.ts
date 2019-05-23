import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss']
})
export class NotFoundPageComponent implements OnInit {

  constructor() { }

  lottieConfig: Object;

  ngOnInit() {
    this.lottieConfig = {
      path: 'assets/404.json',
      autoplay: true,
      loop: false
    };
  }

}
