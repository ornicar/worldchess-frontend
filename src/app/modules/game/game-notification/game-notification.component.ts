import { Component, Input } from '@angular/core';

@Component({
  selector: 'game-notification',
  templateUrl: 'game-notification.component.html',
  styleUrls: ['game-notification.component.scss']
})
export class GameNotificationComponent {
  @Input()
  message: string;

}
