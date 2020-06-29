import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { IFideIdCredentials, PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { AuthSetTokenDirty } from '@app/auth/auth.actions';
import { BehaviorSubject, Subject } from 'rxjs';
import { ICountry } from '@app/broadcast/core/country/country.model';

@Component({
  selector: 'wc-fide-search-profile',
  templateUrl: './fide-search-profile.component.html',
  styleUrls: ['./fide-search-profile.component.scss']
})
export class FideSearchProfileComponent implements OnInit, OnChanges, OnDestroy {

  history = window.history;

  maxSteps$ = this.paygatePopupService.maxSteps$;

  destroy$ = new Subject();

  @Input()
  searchResults: IPlayer[];

  @Output()
  goBack: EventEmitter<boolean> = new EventEmitter<boolean>();

  title = '';

  email = '';
  email$ = this.paygatePopupService.email$.pipe(
    withLatestFrom(this.paygatePopupService.state$),
    take(1),
    map(([email, state]) => {
      if (email) {
        return email;
      }

      if (state.token) {
        this.store$.dispatch(new AuthSetTokenDirty({ token: state.token }));
      }

      return state.email;
    }));

  countries$ = this.paygatePopupService.countries$;
  countries: any[] = [];

  constructor(private paygatePopupService: PaygatePopupService,
              private store$: Store<fromRoot.State>) {}

  ngOnInit() {
    this.email$.pipe(takeUntil(this.destroy$)).subscribe((email) => {
      this.email = email;
    });
    this.countries$.pipe(takeUntil(this.destroy$))
      .subscribe(countries => this.countries = countries);
  }

  getFederationTitle(id: number) {
    const result: ICountry = this.countries.find((country: ICountry) => country.id === id);
    return result.name;
  }

  goToCreateProfile() {
    this.goBack.emit(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.searchResults && this.searchResults.length) {
      this.title = 'We found a player with similar data in&nbsp;the&nbsp;FIDE&nbsp;database';
    } else {
      this.title = 'We didn\'t find players with similar data';
    }
  }

  bindProfile(profile: IPlayer) {
    const credentials = {
      fide_id: profile.fide_id,
      photo: ''
    };

    this.paygatePopupService.setState({
      fideForm: credentials,
      fideFormFilled: true
    });
    this.paygatePopupService.navigateNextStep('fide');
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
