import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import * as moment from 'moment';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { HttpClient } from '@angular/common/http';
import { PaygateForm } from '@app/modules/paygate/_shared/paygate-form.class';
import { PaygateFormControl } from '@app/modules/paygate/_shared/paygate-form-control.class';
import { PlayerResourceService } from '@app/broadcast/core/player/player-resource.service';
import { IPlayer } from '@app/broadcast/core/player/player.model';
import { Store } from '@ngrx/store';
import * as fromRoot from '@app/reducers';
import { AccountRefresh } from '@app/account/account-store/account.actions';
import { selectMyAccount } from '@app/account/account-store/account.reducer';
import { ICountry } from '@app/broadcast/core/country/country.model';

enum FideFormMode {
  CREATE_FIDE,
  ADD_FIDE,
  SEARCH_PROFILE
}

const numberRegex =  /^\d+$/i;

@Component({
  selector: 'wc-fide',
  templateUrl: './fide.component.html',
  styleUrls: ['./fide.component.scss'],
})
export class FideFormComponent implements OnInit, OnDestroy {

  history = window.history;

  years = [...(new Array(100)).keys()].map(x => {
    const year = moment().year() + (x - 99);
    return { label: year, value: year };
  });

  FideFormMode = FideFormMode;
  mode = FideFormMode.CREATE_FIDE;
  searchResults$: BehaviorSubject<IPlayer[]> = new BehaviorSubject(null);
  isSearchLoading$ = new BehaviorSubject(null);

  maxSteps$ = this.paygatePopupService.maxSteps$;
  imagePreLoaded$ = new BehaviorSubject(null);

  fideError$ = new BehaviorSubject<{ [key: string]: string[] }>(null);

  countries$ = this.paygatePopupService.countries$.pipe(
    map((countries: ICountry[]) => {
      if (!countries) {
        return null;
      }

      const countriesWithNoFederation = countries.slice();
      countriesWithNoFederation.unshift({
        name: '',
        id: 193
      } as ICountry);

      return countriesWithNoFederation.map(c => {
        return {
          label: c.name,
          value: c.id
        };
      }).filter(c => (c.label !== 'No Federation'));
    }),
  );

  form = new PaygateForm({
    name: new PaygateFormControl('', [Validators.required]),
    surname: new PaygateFormControl('', [Validators.required]),
    year_of_birth: new PaygateFormControl(null, [Validators.required]),
    place_of_birth: new PaygateFormControl(null, [Validators.required]),
    nationality: new PaygateFormControl(null, [Validators.required]),
    federation: new PaygateFormControl(null, [Validators.required]),
    photo: new PaygateFormControl(null, [Validators.required]),
    is_male: new PaygateFormControl(null, [Validators.required]),
    email: new PaygateFormControl('') // , [Validators.required])
  });

  searchForm = new PaygateForm({
    full_name: new PaygateFormControl('', [Validators.required]),
    birth_year: new PaygateFormControl(null),
  }, [
    (form: PaygateForm) => {
      const { full_name, birth_year } = form.value;
      if (full_name.match(numberRegex)) {
        this.isBirthYearDisabled = true;
        form.controls['birth_year'].setErrors(null);
      } else {
        this.isBirthYearDisabled = false;
        if (!birth_year) {
          form.controls['birth_year'].setErrors({ required: true });
        } else {
          form.controls['birth_year'].setErrors(null);
        }
      }

      return null;
    }
  ]);

  isBirthYearDisabled = false;

  destroy$ = new Subject();

  email = '';
  email$ = this.store$.select(selectMyAccount).pipe(
    map((account) => account.email)
  );

  constructor(private paygatePopupService: PaygatePopupService,
              private router: Router,
              private cd: ChangeDetectorRef,
              private http: HttpClient,
              private store$: Store<fromRoot.State>,
              private playerService: PlayerResourceService
              ) {
    this.form.submit$
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.submit());
    this.searchForm.submit$
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.searchSubmit());
    this.store$.dispatch(new AccountRefresh());
  }

  ngOnInit() {
    this.paygatePopupService.state$.pipe(
      withLatestFrom(this.email$),
      takeUntil(this.destroy$)
    ).subscribe(([state, email]) => {
      this.form.patchValue({
        ...state.fideForm,
        email
      });
      Object.keys(this.form.controls).forEach((key) => {
        if (this.form.controls[key].value) {
          this.form.controls[key].markAsDirty();
        }
      });
      if (state.fideForm && state.fideForm.photo) {
        this.imagePreLoaded$.next(state.fideForm.photo);
      }
    });
  }

  submit() {
    this.fideError$.next(null);
    this.paygatePopupService.setState({
      fideForm: this.form.value,
      fideFormFilled: true
    });
    this.paygatePopupService.navigateNextStep('fide');
  }

  searchSubmit() {
    this.isSearchLoading$.next(true);
    const searchParam: any = {};
    if (this.searchForm.value.full_name.match(numberRegex)) {
      searchParam.fide_id = this.searchForm.value.full_name;
    } else {
      searchParam.full_name = this.searchForm.value.full_name;
      searchParam.birth_year = this.searchForm.value.birth_year;
    }
    this.playerService.search(searchParam)
      .pipe(take(1))
      .subscribe((searchResults: IPlayer[]) => {
        this.searchResults$.next(searchResults);
        this.isSearchLoading$.next(false);
        this.mode = FideFormMode.SEARCH_PROFILE;
      }, (error) => {
        this.isSearchLoading$.next(false);
      });
  }

  setCreateMode() {
    this.mode = FideFormMode.CREATE_FIDE;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  closePopup() {
    this.paygatePopupService.setState({
      fideForm: this.form.value
    });

    this.paygatePopupService.closePopup();
  }
}
