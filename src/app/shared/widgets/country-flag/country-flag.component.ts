import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject} from 'rxjs';
import {distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import * as fromCountry from '../../../broadcast/core/country/country.reducer';
import {OnChangesInputObservable, OnChangesObservable} from '../../decorators/observable-input';

@Component({
  selector: 'wc-country-flag',
  template: `<span class="flag-icon" [class]="'flag-icon ' + (countryCodeClass$ | async)"></span>`,
  styleUrls: [
    './country-flag.component.scss',
    './flag-icon.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountryFlagComponent implements OnChanges {

  @Input() countryId: number;

  @OnChangesInputObservable() countryId$ = new BehaviorSubject<number>(this.countryId);

  countryCodeClass$ = this.countryId$.pipe(
    switchMap(id => this.store$
      .pipe(
        select(fromCountry.selectEntities),
        map(countries => countries[id] ? countries[id].code : null),
        distinctUntilChanged(),
      )
    ),
    map(code => code ?  `flag-icon-${code.toLowerCase()}` : '')
  );

  constructor(private store$: Store<fromCountry.State>) {
  }

  @OnChangesObservable()
  ngOnChanges() {
  }
}
