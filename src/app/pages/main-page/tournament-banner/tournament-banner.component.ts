import { Component, Input } from '@angular/core';
import {TournamentBanner} from '../store/main-page.reducer';

@Component({
  selector: 'wc-main-page-tournament-banner',
  templateUrl: './tournament-banner.component.html',
  styleUrls: ['./tournament-banner.component.scss']
})
export class MainPageTournamentBannerComponent {
  @Input() banner: TournamentBanner;
}
