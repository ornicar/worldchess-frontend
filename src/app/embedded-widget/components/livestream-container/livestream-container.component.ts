import { Component, Input } from '@angular/core';
import {
  LivestreamContainerComponent as LivestreamContainerComponentBase
} from '../../../broadcast/chess/chess-page/livestream-container/livestream-container.component';
import { combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'wcd-livestream-container',
  templateUrl: './livestream-container.component.html',
  styleUrls: ['./livestream-container.component.scss']
})
export class LivestreamContainerComponent extends LivestreamContainerComponentBase {
  @Input() gameUrl = '';

  isVideoBlockShown$: Observable<boolean> = combineLatest(
    this.cameras$,
    this.selectedCamera$
  ).pipe(
    map(([cameras, selectedCamera]) => {
      return !!cameras && cameras.length > 1 && !!selectedCamera;
    }),
  );

  openGoWC() {
    if (!this.tournament) {
      window.open(`${this.gameUrl}(p:paygate/login)`);
    } else {
      this.isAuthorized$.pipe(take(1)).subscribe((isAuth) => {
        if (!isAuth) {
          window.open(`${this.gameUrl}(p:paygate/login)`);
        } else {
          window.open(`${this.gameUrl}(p:paygate/payment)`);
        }
      });
    }
  }
}
