import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import { Store, select } from '@ngrx/store';
import {Observable} from 'rxjs';


import * as forRoot from '../../reducers';
import { AuthSignInFacebook, AuthSignInTwitter } from '../../auth/auth.actions';
import { TwitterOAuthCredentials } from '../dto/response/tokens';
import { SubscriptionHelper, Subscriptions } from '../../shared/helpers/subscription.helper';
import { selectIsAuthorized, selectSignInErrors } from '../../auth/auth.reducer';

@Component({
  selector: 'app-social-sign-in',
  templateUrl: './social-sign-in.component.html',
  styleUrls: ['./social-sign-in.component.scss']
})
export class SocialSignInComponent implements OnInit, OnDestroy {
  private subs: Subscriptions = {};

  private isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized)
  );

  private errors$ = this.store$.pipe(
    select(selectSignInErrors)
  );

  constructor(private route: ActivatedRoute,
              private store$: Store<forRoot.State>) {
  }

  ngOnInit() {
    this.subs.isAuthorized = this.isAuthorized$.subscribe(isAuthorized => {
      if (isAuthorized) {
        self.close();
      }
    });
    this.subs.errors = this.errors$.subscribe(errors => {
      if (errors.non_field_errors) {
        self.close();
      }
    });
    this.route.params.subscribe(params => {
      const social = params['social'];
      if (social === 'twitter') {
        this.twitterSingIn(this.route.queryParams);
      } else if (social === 'facebook') {
        this.facebookSingIn(this.route.queryParams);
      }
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  twitterSingIn(params: Observable<Params>) {
    params.subscribe(queryParams => {
      const credentials: TwitterOAuthCredentials = {
        redirect_state: queryParams['redirect_state'],
        oauth_token: queryParams['oauth_token'],
        oauth_verifier: queryParams['oauth_verifier']
      };
      this.store$.dispatch(new AuthSignInTwitter({ credentials }));
    });
  }

  facebookSingIn(params: Observable<Params>) {
    params.subscribe(queryParams => {
      const code = queryParams['code'];
      this.store$.dispatch(new AuthSignInFacebook({ code }));
    });
  }
}
