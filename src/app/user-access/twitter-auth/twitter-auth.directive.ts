import { Directive, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as forRoot from '../../reducers';
import { AuthService } from '../../client/auth.service';
import { SocialPopupAuth } from '../../client/social-popup-auth';
import { TwitterOAuthTokens } from '../dto/response/tokens';
import { AuthSignInSocialSuccess } from '../../auth/auth.actions';

@Directive({
  selector: '[wcTwitterAuth]'
})
export class TwitterAuthDirective implements OnInit {
  @Output() authCallback = new EventEmitter();

  twitterTokens: TwitterOAuthTokens;

  constructor(private authService: AuthService,
              private store$: Store<forRoot.State>) {
  }

  ngOnInit() {
    this.authService.getTwitterToken()
      .subscribe(tokens => {
        this.twitterTokens = tokens;
      });
  }

  getTwitterUrl(): string {
    return `https://api.twitter.com/oauth/authenticate?oauth_token=${this.twitterTokens.oauth_token}`;
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    e.preventDefault();
    new SocialPopupAuth(this.getTwitterUrl(), 'Twitter', () => {
      this.authCallback.emit();
      this.store$.dispatch(new AuthSignInSocialSuccess());
    }).open();
  }
}