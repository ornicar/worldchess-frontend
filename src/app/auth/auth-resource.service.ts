import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  IActivateCredential,
  INewPasswordCredential,
  IPasswordResetCredential,
  ISignInCredential,
  ISignUpCredential,
  ITokenResponse,
  IUidResponse,
  IActivationCodeResponse,
  ISimpleSignUpCredentials,
  TwitterOAuthCredentials,
} from './auth.model';


@Injectable()
export class AuthResourceService {

  public JWT_ENDPOINT = `${environment.endpoint}/auth/jwt`;

  constructor(private httpClient: HttpClient) { }

  refreshToken(token): Observable<ITokenResponse> {
    return this.httpClient.post<ITokenResponse>(
      `${this.JWT_ENDPOINT}/refresh/`,
      { token }
    );
  }

  signIn(credential: ISignInCredential): Observable<ITokenResponse> {
    return this.httpClient
      .post<ITokenResponse>(
        `${this.JWT_ENDPOINT}/create/`,
        credential,
        { observe: 'response' }
      )
      .pipe(
        map(response => {

          // When previous password been imported and cannot migrate to new database.
          if (response.status === 204) {
            throw new HttpErrorResponse({
              error: response.body,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url
            });
          }

          return response.body;
        })
      );
  }

  signInFacebook(code: string): Observable<ITokenResponse> {
    return this.httpClient
      .post<ITokenResponse>(
        `${environment.endpoint}/auth/facebook/`,
        { code, redirect_uri: environment.facebookRedirect },
        { observe: 'response' }
      ).pipe(
        map(response => {
          if (response.status !== 200) {
            throw new HttpErrorResponse({
              error: response.body,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url
            });
          }

          return response.body;
        })
      );
  }

  signInTwitter(credentials: TwitterOAuthCredentials): Observable<ITokenResponse> {
    return this.httpClient
      .post<ITokenResponse>(
        `${environment.endpoint}/auth/twitter/`,
        credentials,
        { observe: 'response' }
      ).pipe(
        map(response => {
          if (response.status !== 200) {
            throw new HttpErrorResponse({
              error: response.body,
              headers: response.headers,
              status: response.status,
              statusText: response.statusText,
              url: response.url
            });
          }

          return response.body;
        })
      );
  }


  signUp(credential: ISignUpCredential): Observable<ITokenResponse> {
    return this.httpClient.post<ITokenResponse>(
      `${environment.endpoint}/auth/users/create/`,
      credential
    );
  }

  activate(credential: IActivateCredential): Observable<ITokenResponse> {
    return this.httpClient.post<ITokenResponse>(
      `${environment.endpoint}/auth/users/activate/`,
      credential
    );
  }

  passwordReset(credential: IPasswordResetCredential): Observable<any> {
    return this.httpClient.post(
      `${environment.endpoint}/auth/password/reset/`,
      credential
    );
  }

  passwordResetConfirm(credential: INewPasswordCredential): Observable<any> {
    return this.httpClient.post(
      `${environment.endpoint}/auth/password/reset/confirm/`,
      credential
    );
  }

  getUid() {
    return this.httpClient.get<IUidResponse>(
      `${environment.endpoint}/me/uid/`
    );
  }

  signUpCode(credential: ISimpleSignUpCredentials): Observable<ITokenResponse> {
    return this.httpClient.post<ITokenResponse>(
      `${environment.endpoint}/auth/users/simple-auth-code/`,
      credential
    );
  }

  checkEmail(email: string): Observable<any> {
    return this.httpClient.post(
      `${environment.endpoint}/auth/users/email-check/`,
      { email }
    );
  }

  activateCode(code: string, email: string = null): Observable<IActivationCodeResponse> {
    const params = {
      code,
    };
    if (email) {
      params['email'] = email;
    }
    return this.httpClient.post<IActivationCodeResponse>(`${environment.endpoint}/auth/users/activation-code/`, params);
  }

  resendActivationCode(email: string = null): Observable<any> {
    let params = new HttpParams();
    if (email) {
      params = params.set('email', email);
    }
    return this.httpClient.get(`${environment.endpoint}/auth/users/activation-code/`, { params });
  }
}
