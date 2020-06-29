import { map } from 'rxjs/operators';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { select, Store as NGRXStore } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { IAccount } from '@app/account/account-store/account.model';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { filter, shareReplay, takeUntil } from 'rxjs/operators';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { AccountUpdate } from '@app/account/account-store/account.actions';

@Injectable()

export class AccountService implements OnDestroy {

  private destory$ = new Subject();

  private _account$: Observable<IAccount> = this.store$.pipe(
    select(selectMyAccount)
  );

  private _account: IAccount = null;

  constructor (
    private store$: NGRXStore<fromRoot.State>,
    private accountResourceService: AccountResourceService,
  ) {
      this._account$.pipe(
        filter(account => !!account),
        takeUntil(this.destory$)
      ).subscribe((account) => {
        this._account = account;
      });
  }

  getSystemLanguage(): string {
    const languageNav = navigator.language.split('-');
    let myLang = 'en';
    if (Array.isArray(languageNav)) {
      myLang = languageNav[0];
    } else {
      myLang = languageNav;
    }
    return  myLang;
  }

  setLanguage(language: string = 'en'): string {
    if (this._account) {
        this.store$.dispatch(new AccountUpdate({account: {language: language.toUpperCase()}}));
        window.localStorage.setItem('language', language);
      } else {
        window.localStorage.setItem('language', language);
    }
      return  language;
   }

  getLanguage(): Observable<string> {
    return this._account$.pipe(
      map( (account) => {
        let myLanguage = this.getSystemLanguage();
        if (account) {
          if (account.language) {
            myLanguage = this._account.language.toLowerCase();
            window.localStorage.setItem('language', myLanguage);
          }
        } else {
           if (window.localStorage.getItem('language') && window.localStorage.getItem('language') != null) {
             myLanguage  = window.localStorage.getItem('language') || 'en';
           } else {
             window.localStorage.setItem('language', myLanguage);
           }
        }
        return myLanguage;
      }),
      takeUntil(this.destory$)
    );
  }

  ngOnDestroy() {
    this.destory$.next(true);
    this.destory$.complete();
  }
}
