import { Component, Output, EventEmitter, Input } from '@angular/core';
import { EventOrganizer } from '@app/broadcast/core/event/event.model';
import { Tournament } from '@app/broadcast/core/tournament/tournament.model';

@Component({
  selector: 'wc-chess-footer-info',
  templateUrl: './chess-footer-info.component.html',
  styleUrls: ['./chess-footer-info.component.scss']
})
export class ChessFooterInfoComponent {
  @Output() public goToMedia = new EventEmitter();
  @Input() public showMedia = true;
  @Input() public tournament: Tournament = null;
  EventOrganizer = EventOrganizer;

  goToMediaTab(e) {
    e.preventDefault();
    this.goToMedia.emit();
  }
}
