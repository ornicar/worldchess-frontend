import {Component, Input, OnInit} from '@angular/core';
import {BannerDto} from "@app/modules/main/model/banner";

@Component({
  selector: 'mini-banner',
  templateUrl: './mini-banner.component.html',
  styleUrls: ['./mini-banner.component.scss']
})
export class MiniBannerComponent implements OnInit {

  constructor() { }

  @Input()
  data: BannerDto;

  ngOnInit() {
  }

}
