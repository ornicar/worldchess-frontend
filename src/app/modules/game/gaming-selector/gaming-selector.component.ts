import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/account/account-store/account.service';

export enum GamingSelectorMode {
  MainPage,
  SingleGames,
  Tournaments
}

@Component({
  selector: 'gaming-selector',
  templateUrl: './gaming-selector.component.html',
  styleUrls: ['./gaming-selector.component.scss']
})
export class GamingSelectorComponent implements OnInit {
  window = window;
  @Input()
  initialMode: GamingSelectorMode;

  SelectorMode = GamingSelectorMode;

  mode: GamingSelectorMode;

  constructor(
    private route: Router,
    public accountService: AccountService,
  ) {
  }


  ngOnInit() {
    this.mode = this.initialMode;
  }

  goToSingleGames() {
    this.mode = GamingSelectorMode.SingleGames;
    this.route.navigate(['/singlegames']).then();
    window['dataLayerPush']('wchEvent', 'Submenu', 'element_click', 'Single games', '', '');
  }

  goToTournaments() {
    this.mode = GamingSelectorMode.Tournaments;
    this.route.navigate(['/tournaments']).then();
    window['dataLayerPush']('wchEvent', 'Submenu', 'element_click', 'Tournaments', '', '');
  }

  goToMainPage() {
    this.mode = GamingSelectorMode.Tournaments;
    this.route.navigate(['/']).then();
    window['dataLayerPush']('wchEvent', 'Submenu', 'element_click', 'Welcome to gaming', '', '');
  }
}
