import {Component, Input, OnInit} from '@angular/core';
import {Partner} from "@app/modules/main/model/partner";

@Component({
  selector: 'main-page-partner-card',
  templateUrl: './main-page-partner-card.component.html',
  styleUrls: ['./main-page-partner-card.component.scss']
})
export class MainPagePartnerCardComponent implements OnInit {

  constructor() { }

  @Input()
  partner:Partner;


  @Input()
  isDragging: boolean;

  ngOnInit() {
  }

  gotoSite(e:MouseEvent){
    if (this.partner.url && !this.isDragging) {
      window.open(this.partner.url, "_blank")
    }
  }

}
