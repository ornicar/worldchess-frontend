import { Component, OnInit, OnDestroy, Input, forwardRef } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { IPartner } from '../../../../partners/partners.model';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { ITournamentPartner, PartnerType } from '../../../../broadcast/core/tournament/tournament-partners.service';
import { SubscriptionHelper, Subscriptions } from '../../../../shared/helpers/subscription.helper';

function partnerGroupValidator(formPartner: FormGroup) {
  const err = {
    incorrectPartner: 'Please select all fields'
  };
  const partner = formPartner.getRawValue() as Partial<ITournamentPartner>;

  return (!partner.id === !partner.partner_cat === !partner.partner) ? null : err;
}

@Component({
  selector: 'wc-tournament-partner-control',
  templateUrl: './tournament-partner-control.component.html',
  styleUrls: ['./tournament-partner-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TournamentPartnerControlComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TournamentPartnerControlComponent),
      multi: true
    }
  ]
})
export class TournamentPartnerControlComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() partners: IPartner[] = [];

  partnerTypes = [
    {value: PartnerType.MAIN, title: 'Main'},
    {value: PartnerType.ADDITIONAL, title: 'Additional'},
    {value: PartnerType.MASS_MEDIA, title: 'Mass Media'},
  ];

  partnerForm: FormGroup;
  private subs: Subscriptions = {};

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.partnerForm = this.fb.group({
      id: [null],
      partner: [null, [Validators.required]],
      partner_cat: [null, [Validators.required]],
      partner_seq: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
    }, [partnerGroupValidator]);

    this.subs.formChange = this.partnerForm.valueChanges
      .subscribe(v => this.propagateChange(v));
  }

  validate(c: FormControl) {
    return (this.partnerForm && this.partnerForm.invalid) ? this.partnerForm.errors : null;
  }

  writeValue(value: ITournamentPartner) {
    let nextValue;
    if (!!value) {
      nextValue = Object.assign({}, value);
    } else {
      nextValue = {
        id: null,
        partner: null,
        partner_seq: null,
        partner_cat: null,
      };
    }

    this.partnerForm.patchValue(nextValue);
  }

  propagateChange = (_: any) => {
  }
  propagateTouched = (_: any) => {
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn) {
    this.propagateTouched = fn;
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.partnerForm.controls['partner'].disable();
      this.partnerForm.controls['partner_cat'].disable();
      this.partnerForm.controls['partner_seq'].disable();
    } else {
      this.partnerForm.controls['partner'].enable();
      this.partnerForm.controls['partner_cat'].enable();
      this.partnerForm.controls['partner_seq'].enable();

    }
  }
}
