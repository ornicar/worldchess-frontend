import { filter, shareReplay, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '@app/account/account-store/account.service';
import { TranslateService } from '@ngx-translate/core';

/**
 *
 * @interface ILanguage
 */
interface ILanguage {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'game-languages',
  templateUrl: './game-languages.component.html',
  styleUrls: ['./game-languages.component.scss']
})

export class GameLanguagesComponent implements OnInit, OnDestroy {

  window = window;

  /**
   *
   * @memberof GameLanguagesComponent
   */
  destroy$ = new Subject();

  /**
   *
   * @type {ILanguage[]}
   * @memberof GameLanguagesComponent
   */
  languages: ILanguage[] = [
    {value: 'en', viewValue: 'EN'},
    {value: 'ru', viewValue: 'RU'},
    {value: 'fr', viewValue: 'FR'},
    {value: 'es', viewValue: 'ES'},
    //{value: 'ar', viewValue: 'AR'},
    {value: 'tr', viewValue: 'TR'}
  ];

  myLanguage = 'en';
  selectLanguage =  false;



  constructor(
    private accountService: AccountService,
    private translate: TranslateService
  ) {
    this.translate.addLangs(['ru', 'en',
    //'ar',
    'es', 'fr', 'tr']);
  }

  ngOnInit() {
    this.accountService.getLanguage().pipe(
      filter(lang => !!lang),
      takeUntil(this.destroy$),
    ).subscribe((data) => {
      this.myLanguage = data;
      this.translate.use(data);
    });
  }

  showSelecteLanguage(): string {
    const item = this.languages.find(language => language.value === this.myLanguage);
    let _language = 'EN';
    if (item) {
      _language = item.viewValue;
    }
    return _language;
  }


  onSelectLanguage($event) {
    $event.preventDefault();
    this.selectLanguage = !this.selectLanguage;
  }

  changeLanguage(language: ILanguage) {
    this.accountService.setLanguage(language.value);
    this.myLanguage = language.value;
    this.translate.use(this.myLanguage);
    this.selectLanguage = false;
    window['dataLayerPush']('wchCross', 'Footer', 'Language', `${this.myLanguage}`, null, null);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
