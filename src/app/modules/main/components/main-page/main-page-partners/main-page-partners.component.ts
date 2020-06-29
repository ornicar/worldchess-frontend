import {Component, OnInit} from '@angular/core';
import {PartnerService} from "@app/modules/main/service/partner.service";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Partner} from "@app/modules/main/model/partner";
import {IOnlineTournament} from "@app/modules/game/tournaments/models/tournament.model";

@Component({
  selector: 'main-page-partners',
  templateUrl: './main-page-partners.component.html',
  styleUrls: ['./main-page-partners.component.scss']
})
export class MainPagePartnersComponent implements OnInit {

  constructor(private partnerService: PartnerService) {
  }

  data: Partner[] = []

  canMove$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  extendArray = (array: Partner[], minSize: number = 10) => {
    if (array.length === 0) {
      return array;
    }
    let res = [...array] as Partner[];
    while (res.length < minSize) {
      res.push(...array);
    }
    return res;
  }

  ngOnInit() {
    if (this.data.length > 3) {
      this.canMove$.next(true);
      this.data = this.extendArray(this.data)
    }
  }
}
