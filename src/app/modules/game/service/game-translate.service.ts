import { distinctUntilChanged } from 'rxjs/operators';
import { filter } from 'rxjs/operators';
import { AccountService } from './../../../account/account-store/account.service';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable()
export class GameTranslateService {
  constructor(private translate: TranslateService, private accountService: AccountService) {}

  getTranslateService(): TranslateService {
    return this.translate;
  }

  getTranslate(code: string): Observable<string> {
    return this.translate.get(code).pipe(distinctUntilChanged((a: string, b: string) => a === b));
  }

  getTranslateObject(code: string | string[], interpolateParams: Object): Observable<string> {
    return this.translate.get(code, interpolateParams);
  }

  getMyLang(): Observable<string> {
    return this.accountService.getLanguage().pipe(filter((lang) => !!lang));
  }
}
