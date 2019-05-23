import { Component, Input } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { selectIsAuthorized } from '../../../auth/auth.reducer';


@Component({
  selector: 'wc-main-page-banner-wrapper',
  templateUrl: './banner-wrapper.component.html',
  styleUrls: ['./banner-wrapper.component.scss']
})
export class BannerWrapperComponent {
  @Input() showVideo = false;
  @Input() backgroundImage: string = null;

  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  constructor(private store$: Store<fromRoot.State>) {}

  get backgroundImageStyle(): string {
    return !!this.backgroundImage ? `url(${this.backgroundImage})` : 'none';
  }
}
