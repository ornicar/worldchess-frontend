import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import * as fromRoot from '../../../reducers';
import * as fromCountries from '../../../broadcast/core/country/country.reducer';
import { FounderStatus, IAccount } from '../../account-store/account.model';
import {
  selectMyAccount,
  selectMyAccountUpdateErrors,
  selectMyAccountUpdateLoading,
  selectWannBeOrgModalIsOpened
} from '../../account-store/account.reducer';
import {
  AccountUpdate,
  AccountUpdateClear,
  OpenWannaBeOrgModal,
  AccountUpdateSuccess,
  AccountActionTypes
} from '../../account-store/account.actions';
import { ProfileAvatarCropModalComponent } from '../profile-avatar-crop-modal/profile-avatar-crop-modal.component';
import { SubscriptionHelper, Subscriptions } from '../../../shared/helpers/subscription.helper';
import { GetCountries } from '../../../broadcast/core/country/country.actions';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  formErrors$ = this.store$.pipe(select(selectMyAccountUpdateErrors));
  loading$ = this.store$.pipe(select(selectMyAccountUpdateLoading));
  account$ = this.store$.pipe(select(selectMyAccount));
  countries$ = this.store$.pipe(select(fromCountries.selectAll));
  accountCountry$ = this.account$.pipe(
    switchMap((account) => this.store$.pipe(
      select(fromCountries.selectCountryById(), { countryId: account.country || 0 })
    ))
  );

  wannaBeOrgModalIsOpened$ = this.store$.pipe(
    select(selectWannBeOrgModalIsOpened)
  );

  profileForm: FormGroup;
  FounderStatus = FounderStatus;

  private subs: Subscriptions = {};

  editMode = false;
  avatarEditor: MatDialogRef<ProfileAvatarCropModalComponent> = null;
  avatarEditorSubscription: Subscription = null;

  matesOptions = [
    { label: 'Has an account', value: true },
    { label: 'Has no account', value: false }
  ];

  constructor(private store$: Store<fromRoot.State>,
              private actions$: Actions,
              private dialog: MatDialog) {
    this.store$.dispatch(new GetCountries());
    this.actions$.pipe(
      ofType<AccountUpdateSuccess>(AccountActionTypes.UpdateSuccess)
    ).subscribe(() => {
      this.editMode = false;
    });
  }

  ngOnInit() {
    this.initForm();
  }

  async updateProfile() {
    this.profileForm.updateValueAndValidity();
    if (this.profileForm.invalid) {
      return;
    }
    const isLoading = await this.loading$.pipe(take(1)).toPromise();
    if (isLoading) {
      return;
    }

    const partialAccount: Partial<IAccount> = (({
      full_name,
      nickname,
      receive_newsletters,
      birth_date,
      country,
      facebook,
      twitter,
      instagram,
      mates,
      is_public
    }) => ({
      full_name,
      nickname,
      receive_newsletters,
      country,
      facebook,
      twitter,
      instagram,
      mates,
      is_public,
      birth_date: birth_date.format('YYYY-MM-DD')
    }))(this.profileForm.value);

    const account = await this.account$.pipe(take(1)).toPromise();
    if (account.founder_approve_status === FounderStatus.NONE && this.profileForm.value['founder_approve_status']) {
      partialAccount.founder_approve_status = FounderStatus.WAIT;
    }
    this.store$.dispatch(new AccountUpdate({account: partialAccount}));
  }

  ngOnDestroy() {
    this.store$.dispatch(new AccountUpdateClear());
    SubscriptionHelper.unsubscribe(this.subs);
    this.closeAvatarEditor();
  }

  async discardOrganizer() {
    const isLoading = await this.loading$.pipe(take(1)).toPromise();
    if (isLoading) {
      return;
    }
    this.store$.dispatch(new AccountUpdate({account: {founder_approve_status: FounderStatus.NONE}}));
  }

  private initForm() {
    this.profileForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      full_name: new FormControl('', [Validators.required]),
      nickname: new FormControl('', []),
      founder_approve_status: new FormControl(false, []),
      receive_newsletters: new FormControl(false, []),
      birth_date: new FormControl(moment(), []),
      country: new FormControl(null, []),
      facebook: new FormControl('', []),
      twitter: new FormControl('', []),
      instagram: new FormControl('', []),
      is_public: new FormControl('', []),
      mates: new FormControl(false, [])
    });

    this.setFormValue();
  }

  setFormValue() {
    this.account$
      .pipe(take(1))
      .subscribe(account => {
        this.profileForm.setValue({
          email: account.email,
          full_name: account.full_name,
          nickname: account.nickname,
          founder_approve_status: account.founder_approve_status === FounderStatus.APPROVE,
          receive_newsletters: account.receive_newsletters,
          birth_date: !!account.birth_date ? moment(account.birth_date) : moment(),
          country: account.country || 0,
          facebook: account.social_accounts.facebook || '',
          twitter: account.social_accounts.twitter || '',
          instagram: account.social_accounts.instagram || '',
          mates: !!account.social_accounts.mates,
          is_public: !!account.is_public,
        });
      });
  }

  openWannaBeOrgModal() {
    this.store$.dispatch(new OpenWannaBeOrgModal());
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  cancelEdit() {
    this.editMode = false;
    this.setFormValue();
  }

  openAvatarEditor() {
    if (!this.avatarEditor) {
      this.avatarEditor = this.dialog.open(ProfileAvatarCropModalComponent);
      this.avatarEditorSubscription = this.avatarEditor.afterClosed().subscribe((data) => {
        if (data) {
          this.store$.dispatch(new AccountUpdate({ account: { avatar: data } }));
        }
        if (this.avatarEditorSubscription) {
          this.avatarEditorSubscription.unsubscribe();
          this.avatarEditorSubscription = null;
        }
        this.avatarEditor = null;
      });
    }
  }

  closeAvatarEditor() {
    if (this.avatarEditor) {
      this.avatarEditor.close();
      this.avatarEditor = null;
    }
  }
}
