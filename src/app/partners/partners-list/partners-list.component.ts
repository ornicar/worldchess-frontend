import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PartnersService } from '../partners.service';
import { Subscription } from 'rxjs';
import { IEventPartner } from '../partners.model';
import { NguCarouselConfig } from '@ngu/carousel';
import { slider } from './partners.animation';

export const comparePartnersFn = (a: IEventPartner, b: IEventPartner) => {
  if (a.partner_cat === b.partner_cat) {
    return a.partner_seq - b.partner_seq;
  } else {
    return a.partner_cat - b.partner_cat;
  }
};

@Component({
  selector: 'app-partners-list',
  templateUrl: './partners-list.component.html',
  styleUrls: ['./partners-list.component.scss'],
  animations: [slider],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartnersListComponent implements OnInit, OnDestroy {
  partnersSs: Subscription;

  public partners: IEventPartner[] = [];

  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 3, md: 4, lg: 5, all: 0 },
    speed: 150,
    slide: 1,
    point: {
      visible: true
    },
    touch: true,
    loop: true,
    interval: { timing: 15000 },
    // animation: 'lazy'
  };

  constructor(private partnersService: PartnersService, private cd: ChangeDetectorRef) {
   }

  public comparePartnersFn = comparePartnersFn;

  public ngOnInit() {
    this.partnersSs = this.partnersService.getAllEventPartners()
      .subscribe((partners) => {
        this.partners = partners.sort(this.comparePartnersFn);;
        this.cd.markForCheck();
      });
  }

  public ngOnDestroy() {
    this.partnersSs.unsubscribe();
  }

  public getImageUrl(imageUrl) {
    return `url(${imageUrl})`;
  }
  public lowerCase(string: string) {
    return string ? string.toLowerCase() : '';
  }

}
