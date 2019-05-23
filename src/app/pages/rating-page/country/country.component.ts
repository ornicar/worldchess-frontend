import {
  ChangeDetectionStrategy,
  Component, HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as fromCountry from '../../../broadcast/core/country/country.reducer';
import {select, Store} from '@ngrx/store';
import {map, switchMap} from 'rxjs/operators';
import {ICountry} from '../../../broadcast/core/country/country.model';
import * as fromRoot from '../../../reducers';
import {OnChangesInputObservable, OnChangesObservable} from '../../../shared/decorators/observable-input';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'wc-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryComponent implements OnInit, OnChanges {
  @Input() federation: number;

  @OnChangesInputObservable()
  federation$ = new BehaviorSubject(this.federation);

  countryName$ = this.federation$
    .pipe(
      switchMap(federation => this.store$.pipe(select(fromCountry.selectCountryById(), {countryId: federation}))),
      map((country: ICountry) => country ? country.long_code : '')
    );

  @HostBinding('class') componentClass = 'country';

  constructor(private store$: Store<fromRoot.State>) {}

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
  }
}
