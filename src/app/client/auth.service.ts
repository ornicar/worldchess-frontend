import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Tokens, TwitterOAuthTokens} from '../user-access/dto/response/tokens';
import {AbstractService} from './abstract-service';


@Injectable()
export class AuthService extends AbstractService {

  private readonly EXPIRE_TOKEN = 1000 * 60 * 15; // 15 min

  private readonly ENDPOINT = environment.endpoint;

  public isAuthorized$: BehaviorSubject<boolean>;

  constructor(private httpClient: HttpClient,
              private cookieService: CookieService,
              private router: Router) {
    super();

    this.isAuthorized$ = new BehaviorSubject<boolean>(!this.isNotLogin());
  }

  getTwitterToken(): Observable<TwitterOAuthTokens> {
    return this.httpClient.post<TwitterOAuthTokens>(`${this.ENDPOINT}/auth/twitter/`, {}).pipe(
      map(tokens => tokens)
    );
  }

  verifyTwitter(redirectState: string, oauthToken: string, oauthVerifier: string): Observable<Tokens> {
    let params = new HttpParams();
    params = params.set('redirect_state', redirectState);
    params = params.set('oauth_token', oauthToken);
    params = params.set('oauth_verifier', oauthVerifier);
    return this.httpClient.post<Tokens>(`${this.ENDPOINT}/auth/twitter/`, {
      params: params
    })
      .pipe(
        tap((tokens: Tokens) => this.saveToken(tokens))
      );
  }

  facebookSignIn(code: string): Observable<Tokens> {
    const redirecеtUri = environment.facebookRedirect;
    return this.httpClient.post<Tokens>(`${this.ENDPOINT}/auth/facebook/`, {
      code,
      redirect_uri: redirecеtUri
    })
      .pipe(
        tap((tokens: Tokens) => this.saveToken(tokens))
      );
  }

  saveToken(tokens: Tokens) {
    const options = {
      expires: new Date(Date.now() + this.EXPIRE_TOKEN),
      path: '/'
    };
    this.cookieService.put(this.ACCESS_TOKEN, tokens.access_token, options);
    this.cookieService.put(this.REFRESH_TOKEN, tokens.refresh_token, {path: '/'});
    this.isAuthorized$.next(true);
  }

  public isAuthorized(): Observable<boolean> {
    return of(!this.isNotLogin());
  }

  protected getCookieService(): CookieService {
    return this.cookieService;
  }
}
