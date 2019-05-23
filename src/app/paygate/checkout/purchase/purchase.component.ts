import {Component, Input, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Angulartics2} from 'angulartics2';
import {of} from 'rxjs';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';
import {AuthResourceService} from '../../../auth/auth-resource.service';
import {
  AuthActionTypes,
  AuthLogout,
  AuthRefreshToken, AuthRefreshTokenError, AuthRefreshTokenSuccess,
  AuthSignInError,
  AuthSignInSuccess,
  AuthSignUpError,
  AuthSignUpSuccess
} from '../../../auth/auth.actions';
import {ISignInCredential, ISignUpCredential} from '../../../auth/auth.model';
import {decodeToken, selectToken} from '../../../auth/auth.reducer';
import * as forRoot from '../../../reducers';
import {BuyObserver} from '../../buy-observer';
import {Plan} from '../../dto/plan';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {

  @Input() buyProcessStart = false;
  @Input() selectedPlan: Plan;
  @Input() isAuthorized: boolean;

  successful = false;
  loading = false;

  buyStatus = '';

  public authBlockIsSingInMode = true;

  private signInCredential: ISignInCredential;

  private signUpCredential: ISignUpCredential;

  constructor(
    private buyObserver: BuyObserver,
    private angulartics2: Angulartics2,
    private store$: Store<forRoot.State>,
    private authResource: AuthResourceService) {
  }

  ngOnInit() {
  }

  onSignInCredentialChange(credential) {
    this.signInCredential = credential;
  }

  onSignUpCredentialChange(credential) {
    this.signUpCredential = credential;
  }

  private signIn() {
    // @todo crate service.
    return this.authResource.signIn(this.signInCredential).pipe(
      tap(
        ({ token }) => this.store$.dispatch(new AuthSignInSuccess({ token })),
        (resp = {}) => {
          const errors = typeof resp.error === 'object' ? resp.error : {},
            // When previous password been imported and cannot migrate to new database.
            passwordBeenReset = resp.status === 204;

          this.store$.dispatch(new AuthSignInError({ errors, passwordBeenReset }));
        }
      )
    );
  }

  private signUp() {
    // @todo crate service.
    return this.authResource.signUp(this.signUpCredential).pipe(
      tap(
        ({ token }) => this.store$.dispatch(new AuthSignUpSuccess({ token })),
        (resp = {}) => {
          const errors = resp.error || {};

          this.store$.dispatch(new AuthSignUpError({ errors }));
        }
      )
    );
  }

  buyStart() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    if (!this.isAuthorized) {
      this.buyStatus = 'authorization...';

      const auth$ = this.authBlockIsSingInMode ? this.signIn() : this.signUp();

      auth$.subscribe(
        () => {
          this.buyStatus = 'purchase...';
          this.buyObserver.emitBuyStart(true);
        },
        () => {
          this.loading = false;
          this.buyStatus = '';
        }
      );
    } else {
      this.buyStatus = 'purchase...';
      this.buyObserver.emitBuyStart(true);
    }
  }

  couponStart() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    // if (!this.isAuthorized) {
    //   this.buyStatus = 'authorization...';
    //
    //   const auth$ = this.authBlockIsSingInMode ? this.signIn() : this.signUp();
    //
    //   auth$.subscribe(
    //     () => {
    //       this.buyStatus = 'check promo code...';
    //       this.buyObserver.emitCouponStart(true);
    //     },
    //     () => {
    //       this.loading = false;
    //       this.buyStatus = '';
    //     }
    //   );
    // } else {
      this.buyStatus = 'check promo code...';
      this.buyObserver.emitCouponStart(true);
    // }
  }

  couponEnd() {
    this.loading = false;
    this.buyStatus = '';
  }

  buyEnd(isSuccess: boolean) {
    this.loading = false;
    this.buyStatus = '';
    this.successful = isSuccess;

    if (isSuccess) {
      this.angulartics2.eventTrack.next({
        action: 'buy-success',
        properties: { category: 'payment-modal' },
      });

      this.refresh().subscribe(action => {
        if (action.type === AuthActionTypes.RefreshTokenSuccess) {
          const tokenData = decodeToken(action.payload.token);

          if (tokenData.profile.premium) {
            // save new token.
            this.store$.dispatch(action);
          } else {
            this.logout();
          }
        } else {
          this.logout();
        }
      });
    }
  }

  logout() {
    this.store$.dispatch(new AuthLogout());
  }

  /**
   * @deprecated
   */
  refresh() {
    return this.store$.pipe(
      select(selectToken),
      take(1),
      // tap((token) => console.log('token', decodeToken(token))),
      switchMap((token) =>
        this.authResource.refreshToken(token).pipe(
          // tap(({ token: newToken }) => console.log('newToken ', this.conut++, decodeToken(newToken))),
          map(({ token: newToken }) => new AuthRefreshTokenSuccess({ token: newToken })),
          catchError(() => of(new AuthRefreshTokenError()))
        )
      )
    );
  }

  switchSingInForm(isSingIn) {
    this.authBlockIsSingInMode = isSingIn;
  }
}
