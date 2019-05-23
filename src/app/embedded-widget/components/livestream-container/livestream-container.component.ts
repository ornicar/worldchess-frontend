import { Component } from '@angular/core';
import { LivestreamContainerComponent as LivestreamContainerComponentBase } from '../../../broadcast/chess/chess-page/livestream-container/livestream-container.component';

@Component({
  selector: 'wcd-livestream-container',
  templateUrl: './livestream-container.component.html',
  styleUrls: ['./livestream-container.component.scss']
})
export class LivestreamContainerComponent extends LivestreamContainerComponentBase {
}
