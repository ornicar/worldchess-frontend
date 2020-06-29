import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFideFormState, PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { PaygateForm } from '@app/modules/paygate/_shared/paygate-form.class';
import { PaygateFormControl } from '@app/modules/paygate/_shared/paygate-form-control.class';
import { Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { PaygateService } from '@app/modules/paygate/services/paygate.service';

@Component({
  selector: 'wc-fide-verification',
  templateUrl: './fide-verification.component.html',
  styleUrls: ['./fide-verification.component.scss']
})
export class FideVerificationComponent implements OnDestroy {

  history = window.history;
  maxSteps$ = this.paygatePopupService.maxSteps$;

  form = new PaygateForm({
    national_id_selfie: new PaygateFormControl('', [Validators.required])
  });

  verifyInProgress$ = new BehaviorSubject(null);
  maximumUploadSizeExceededError$ = new BehaviorSubject(false);

  destroy$ = new Subject();

  fideForm: IFideFormState;

  constructor(
    private paygatePopupService: PaygatePopupService,
    private paygateService: PaygateService
  ) {
    this.form.submit$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => this.submitVerification());
    this.paygatePopupService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((state) => {
      this.fideForm = state.fideForm;
      if (this.fideForm.national_id_selfie) {
        this.form.patchValue({
          national_id_selfie: this.fideForm.national_id_selfie
        });
      }
    });
  }

  closePopup() {
    this.paygatePopupService.setState({
      fideForm: {
        ...this.form.value,
        ...this.fideForm
      }
    });

    this.paygatePopupService.closePopup();
  }

  submitVerification() {
    this.verifyInProgress$.next(true);
    const data: any = {
      ...this.fideForm,
      ...this.form.value
    };
    let createFideId = false;
    if (data.fide_id === '') {
      delete data.fide_id;
      createFideId = true;
    } else {
      data.fide_id = +data.fide_id;
    }

    if (!data.fide_id) {
      data.full_name = `${data.name} ${data.surname}`;
      delete data.name;
      delete data.surname;
      delete data.fide_id;
      data.date_of_birth = `${data.year_of_birth}-01-01`;
      delete data.year_of_birth;
    }

    this.paygatePopupService.submitFide(data).pipe(
      take(1),
    ).subscribe(() => {
      window['dataLayerPush'](
        'wchReg',
        'Become a member',
        'Profile confirm',
        this.paygateService.calcTotalForGtag(),
        '5',
        createFideId ? 'create a passport' : 'already have one'
      );
      this.paygatePopupService.navigateNextStep('fide-verification');
      this.verifyInProgress$.next(false);
    }, (error) => {
      if (error && error.status === 413) {
        this.maximumUploadSizeExceededError$.next(false);
        this.maximumUploadSizeExceededError$.next(true);
      }
      this.verifyInProgress$.next(false);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
