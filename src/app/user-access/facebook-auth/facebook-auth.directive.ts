import { Directive, HostListener, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { SocialPopupAuth } from '../../client/social-popup-auth';
import * as forRoot from '../../reducers';
import { AuthSignInSocialSuccess } from '../../auth/auth.actions';

@Directive({
  selector: '[wcFacebookAuth]'
})
export class FacebookAuthDirective {
  @Output() authCallback = new EventEmitter();

  readonly appId = environment.facebookAppId;

  constructor(private store$: Store<forRoot.State>) {}

  getFacebookUrl(): string {
    return `https://www.facebook.com/v3.1/dialog/oauth?
    client_id=${this.appId}&
    response_type=code&
    scope=email&
    redirect_uri=${environment.facebookRedirect}`
      .replace(/ /g, '');
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    e.preventDefault();
    new SocialPopupAuth(this.getFacebookUrl(), 'Facebook', () => {
      this.authCallback.emit();
      this.store$.dispatch(new AuthSignInSocialSuccess());
    }).open();
  }
}