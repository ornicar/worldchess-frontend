import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthService} from '../../client/auth.service';
import {SocialPopupAuth} from '../../client/social-popup-auth';
import { TwitterOAuthTokens } from '../dto/response/tokens';
import { Store } from '@ngrx/store';
import * as forRoot from '../../reducers';
import { AuthSignInSocialSuccess } from '../../auth/auth.actions';

@Component({
  selector: 'app-twitter-auth',
  templateUrl: './twitter-auth.component.html',
  styleUrls: ['./twitter-auth.component.scss']
})
export class TwitterAuthComponent implements OnInit {

  @Input() inPopup = true;
  @Output() authCallback = new EventEmitter();

  twitterTokens: TwitterOAuthTokens;

  constructor(private authService: AuthService,
              private store$: Store<forRoot.State>) { }

  ngOnInit() {
    this.authService.getTwitterToken()
      .subscribe(tokens => {
        this.twitterTokens = tokens;
      });
  }

  getTwitterUrl(): string {
    return `https://api.twitter.com/oauth/authenticate?oauth_token=${this.twitterTokens.oauth_token}`;
  }

  authPopup() {
    new SocialPopupAuth(this.getTwitterUrl(), 'Twitter', () => {
      this.authCallback.emit();
      this.store$.dispatch(new AuthSignInSocialSuccess());
    }).open();
  }
}
