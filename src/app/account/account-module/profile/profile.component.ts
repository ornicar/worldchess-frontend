import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { take, switchMap, filter, map } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import * as fromRoot from '../../../reducers';
import * as fromCountries from '../../../broadcast/core/country/country.reducer';
import { IAccount } from '../../account-store/account.model';
import {
  selectIsFideVerifiedUser,
  selectMyAccount, selectMyAccountDelete,
  selectMyAccountUpdateErrors,
  selectMyAccountUpdateLoading,
} from '../../account-store/account.reducer';
import {
  AccountUpdate,
  AccountUpdateClear,
  AccountUpdateSuccess,
  AccountActionTypes,
  AccountDelete, AccountDeleteClear
} from '../../account-store/account.actions';
import { ProfileAvatarCropModalComponent } from '../profile-avatar-crop-modal/profile-avatar-crop-modal.component';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import { GetCountries } from '@app/broadcast/core/country/country.actions';
import { selectActivePlanSubscription } from '@app/purchases/subscriptions/subscriptions.reducer';
import { Router } from '@angular/router';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { PlayerRatingResourceService } from '@app/modules/app-common/services/player-rating-resource.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  loading$ = this.store$.pipe(select(selectMyAccountUpdateLoading));
  account$: Observable<IAccount> = this.store$.pipe(select(selectMyAccount));
  isFideVerifiedUser$: Observable<boolean> = this.store$.pipe(select(selectIsFideVerifiedUser));
  accountDeleteError$ = this.store$.pipe(select(selectMyAccountDelete));
  countries$ = this.store$.pipe(select(fromCountries.selectAll));
  accountCountry$ = this.account$.pipe(
    switchMap((account) => this.store$.pipe(
      select(fromCountries.selectCountryById(), { countryId: account && account.country || 0 })
    ))
  );

  profileForm: FormGroup;
  oldEmail: string;

  private subs: Subscriptions = {};

  editMode = false;
  avatarEditor: MatDialogRef<ProfileAvatarCropModalComponent> = null;
  avatarEditorSubscription: Subscription = null;

  activeSubscription$ = this.store$.pipe(
    select(selectActivePlanSubscription),
  );

  accountType$ = this.activeSubscription$.pipe(
    map((subscription) => {
      return !!subscription ? 'pro' : 'basic';
    }),
  );

  avatarClass$ = this.accountType$.pipe(
    map((type: string) => {
      return `profile__account-avatar--${type}`;
    }),
  );

  accountTypeClass$ = this.accountType$.pipe(
    map((type: string) => {
      return `profile__account-type--${type}`;
    }),
  );

  matesOptions = [
    { label: 'Has an account', value: true },
    { label: 'Has no account', value: false }
  ];

  constructor(
    private store$: Store<fromRoot.State>,
    private actions$: Actions,
    private dialog: MatDialog,
    private ratingResource: PlayerRatingResourceService,
    private modalService: ModalWindowsService,
    private router: Router,
    private accountService: AccountResourceService
  ) {
    this.store$.dispatch(new GetCountries());
    this.actions$.pipe(
      ofType<AccountUpdateSuccess>(AccountActionTypes.UpdateSuccess)
    ).subscribe(() => {
      this.editMode = false;
    });

  }

  ngOnInit() {
      this.subs.accountDeleteError = this.accountDeleteError$.subscribe((error) => {
      if (error['non_field_errors']) {
        this.modalService.alert('', `You cannot remove your account until your events finish.
        Please repeat the request once the events are finished. Thank you!`);
        this.store$.dispatch(new AccountDeleteClear());
      }
    });
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

    const isFideVerifiedUser = await this.isFideVerifiedUser$.pipe(take(1)).toPromise();

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
    }) => {
      if (!isFideVerifiedUser) {
        return {
          full_name,
          nickname,
          receive_newsletters,
          country: country || null,
          facebook,
          twitter,
          instagram,
          mates,
          is_public,
          birth_date: birth_date.format('YYYY-MM-DD')
        };
      } else {
        return {
          receive_newsletters,
          facebook,
          twitter,
          instagram,
          mates,
          is_public,
        };
      }
    })(this.profileForm.value);

    this.account$.pipe(
      filter(account => !!account),
      take(1),
    ).subscribe((account) => {
      this.store$.dispatch(new AccountUpdate({account: partialAccount}));
    });
  }

  ngOnDestroy() {
    this.store$.dispatch(new AccountUpdateClear());
    SubscriptionHelper.unsubscribe(this.subs);
    this.closeAvatarEditor();
  }

  private initForm() {
    this.profileForm = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        updateOn: 'blur'}),
      full_name: new FormControl('', [Validators.required]),
      nickname: new FormControl('', []),
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
    this.setSubscribtionForEmailChange();
  }

  setSubscribtionForEmailChange() {
    const emailControl = this.profileForm.get('email');

    this.subs.emailSub = emailControl
      .valueChanges
      .subscribe((val) => {
        if (val && val !== this.oldEmail && emailControl.status === 'VALID') {
          this.changeEmail(val);
        }
      });
  }

  setFormValue() {
    this.account$
      .pipe(
        filter(account => !!account),
        take(1),
      ).subscribe(account => {
        this.profileForm.setValue({
          email: account.email,
          full_name: account.full_name,
          nickname: account.nickname,
          receive_newsletters: account.receive_newsletters,
          birth_date: !!account.birth_date ? moment(account.birth_date) : moment(),
          country: account.country || 0,
          facebook: account.social_accounts.facebook || '',
          twitter: account.social_accounts.twitter || '',
          instagram: account.social_accounts.instagram || '',
          mates: !!account.social_accounts.mates,
          is_public: !!account.is_public,
        });

        this.oldEmail = account.email;
      });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  openDeleteProfilePopup() {
    this.modalService.confirm(
      'Delete profile',
      'Are you sure to delete your profile?',
      500,
      'Delete',
      'Cancel'
    ).pipe(
      filter(confirm => confirm),
    ).subscribe(() => {
      this.deleteProfile();
    });
  }

  deleteProfile() {
    this.store$.dispatch(new AccountDelete());
  }

  changeEmail(newEmail: string) {
    this.accountService.changeEmail(newEmail).subscribe((response) => {
      this.router.navigate(
        ['', { outlets: { p: ['paygate', `confirm`, newEmail ]}} ]
      );
    });
  }

  cancelEdit() {
    this.editMode = false;

    if (this.subs.emailSub) {
      this.subs.emailSub.unsubscribe();
    }

    this.setFormValue();
    this.setSubscribtionForEmailChange();
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
