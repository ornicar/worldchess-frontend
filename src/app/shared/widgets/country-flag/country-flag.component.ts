import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {select, Store} from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
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
export class CountryFlagComponent implements OnChanges, OnDestroy {

  @Input() countryId: number;
  @Input() countryCode: string;
  countryId$ = new BehaviorSubject<number>(null);
  countryCode$ = new BehaviorSubject<string>(null);
  countryCodeClass$ = new BehaviorSubject<string>(null);
  destroy$ = new Subject();

  constructor(private store$: Store<fromCountry.State>) {
    this.countryId$.pipe(
      takeUntil(this.destroy$),
      filter(id => !!id),
      switchMap(id => this.store$
                          .pipe(
                            select(fromCountry.selectEntities),
                            map(countries => countries[id] ? countries[id].code : null),
                            distinctUntilChanged(),
                          )
      ),
      map(code => code ?  `flag-icon-${code.toLowerCase()}` : '')
    ).subscribe((className) => {
      this.countryCodeClass$.next(className);
    });

    this.countryCode$.pipe(
      takeUntil(this.destroy$),
      filter(code => !!code),
      map(code => `flag-icon-${code.toLowerCase()}`),
    ).subscribe((className) => {
      this.countryCodeClass$.next(className);
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['countryId']) {
      this.countryId$.next(Number(changes['countryId'].currentValue));
    }

    if (changes['countryCode']) {
      this.countryCode$.next(String(changes['countryCode'].currentValue));
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
