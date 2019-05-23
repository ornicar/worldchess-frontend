import { Component, OnInit, OnDestroy, AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
// import {PartnershipService} from '../partnership.service';
// import {Partnership} from '../partnership';
import {ActivatedRoute} from '@angular/router';
import { Subscription } from 'rxjs';
import { IEventPartner } from '../../../partners/partners.model';
import { PartnersService } from '../../../partners/partners.service';
import { comparePartnersFn } from '../../../partners/partners-list/partners-list.component';

@Component({
  selector: 'app-partnership-page',
  templateUrl: './partnership-page.component.html',
  styleUrls: ['./partnership-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartnershipPageComponent implements OnInit, AfterViewChecked, OnDestroy {
  partnersSs: Subscription;
  public partners: IEventPartner[] = [];
  public loaded = false;
  public needToScroll = false;
  // partnership: Partnership[];
  activeTab: string;
  fragment: string;
  public comparePartnersFn = comparePartnersFn;

  constructor(private route: ActivatedRoute,
    private partnersService: PartnersService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.activeTab = 'official';
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
    this.partnersSs = this.partnersService.getAllEventPartners()
      .subscribe((partners) => {
        this.partners = partners.sort(this.comparePartnersFn);
        if (this.fragment) {
          this.needToScroll = true;
        }
        this.cd.markForCheck();
      });
  }

  ngAfterViewChecked(): void {
    if (this.needToScroll) {
      this.goTo(this.fragment);
      this.needToScroll = false;
    }
  }

  ngOnDestroy() {
    this.partnersSs.unsubscribe();
  }

  public lowerCase(string: string) {
    return string ? string.toLowerCase() : '';
  }

  goTo(hash) {
      try {
          document.getElementById(hash).scrollIntoView();
      } catch (e) { }
  }

  onClick(event) {
    this.activeTab = event.srcElement.id;
  }

  // getImageUrl(news: News) {
  //   return `url(${news.image})`;
  // }
  //

}
