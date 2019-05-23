import {HttpHeaders} from '@angular/common/http';
import {CookieService} from 'ngx-cookie';
import {isUndefined} from 'util';
import {environment} from '../../environments/environment';

export abstract class AbstractService {

  protected readonly ACCESS_TOKEN = 'access_token_old';
  protected readonly REFRESH_TOKEN = 'refresh_token_old';

  protected readonly REST_BASE_URL = environment.restServer;

  protected getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getCookieService().get(this.ACCESS_TOKEN)}`
    });
  }

  protected isExpireToken(): boolean {
    return this.cookieExist(this.REFRESH_TOKEN) && !this.cookieExist(this.ACCESS_TOKEN);
  }

  protected isNotLogin(): boolean {
    return !this.cookieExist(this.REFRESH_TOKEN) && !this.cookieExist(this.ACCESS_TOKEN);
  }

  protected cookieExist(cookieName: string): boolean {
    return !isUndefined(this.getCookieService().get(cookieName));
  }

  protected abstract getCookieService(): CookieService;
}
