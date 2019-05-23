import { Component, isDevMode } from '@angular/core';

@Component({
  selector: 'app-tournaments-online',
  templateUrl: 'tournaments-online.component.html',
  styleUrls: ['tournaments-online.component.scss']
})
export class TournamentsOnlineComponent {

  get isDevMode(): boolean {
    return isDevMode();
  }
}
