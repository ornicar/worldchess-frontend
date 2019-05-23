import {Component, EventEmitter, Input, Output} from '@angular/core';
import {environment} from '../../../environments/environment';
import {SocialPopupAuth} from '../../client/social-popup-auth';
import * as forRoot from '../../reducers';
import { Store } from '@ngrx/store';
import { AuthSignInSocialSuccess } from '../../auth/auth.actions';

@Component({
  selector: 'app-facebook-auth',
  templateUrl: './facebook-auth.component.html',
  styleUrls: ['./facebook-auth.component.scss']
})
export class FacebookAuthComponent {

  readonly appId = environment.facebookAppId;

  @Input() inPopup = true;
  @Output() authCallback = new EventEmitter();


  constructor(private store$: Store<forRoot.State>) {}

  getFacebookUrl(): string {
    return `https://www.facebook.com/v3.1/dialog/oauth?
    client_id=${this.appId}&
    response_type=code&
    scope=email&
    redirect_uri=${environment.facebookRedirect}`
      .replace(/ /g, '');
  }

  authPopup() {
    new SocialPopupAuth(this.getFacebookUrl(), 'Facebook', () => {
      this.authCallback.emit();
      this.store$.dispatch(new AuthSignInSocialSuccess());
    }).open();
  }
}
