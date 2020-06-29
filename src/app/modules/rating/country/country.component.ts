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
import * as fromRoot from '../../../reducers/index';
import {OnChangesInputObservable, OnChangesObservable} from '../../../shared/decorators/observable-input';
import {BehaviorSubject} from 'rxjs';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';

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

  country$ = this.federation$
    .pipe(
      switchMap(federation => this.countryResourceService.get(federation)),
    );

  countryCode$ = this.country$.pipe(
    map((country: ICountry) => country ? country.code : ''),
  );

  countryName$ = this.country$.pipe(
    map((country: ICountry) => country ? country.long_code : ''),
  );

  @HostBinding('class') componentClass = 'country';

  constructor(private countryResourceService: CountryResourceService) {}

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges(changes: SimpleChanges): void {
  }
}
