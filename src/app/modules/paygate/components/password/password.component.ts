import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { map, switchMap, take, merge } from 'rxjs/operators';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { AuthResourceService } from '../../../../auth/auth-resource.service';

@Component({
  selector: 'wc-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent {

  passwordError$ = new BehaviorSubject<{ [key: string]: string[] }>({});

  @Input() embedded = false;
  @Output() success = new EventEmitter();

  form = new FormGroup({
    new_password: new FormControl('', [ Validators.required ]),
    repeat: new FormControl('', [ Validators.required ]),
  });

  formErrors$ = this.form.valueChanges.pipe(
    merge(this.passwordError$),
    map(() => {
      const responseErrors = this.passwordError$.getValue();
      const errors = {};
      Object.keys(this.form.controls).forEach((control) => {
        if (this.form.controls[control].dirty) {
          const controlErrors = {
            ...this.form.controls[control].errors,
            ...(responseErrors[control] && responseErrors[control].length ? { response: responseErrors[control][0] } : {})
          };
          errors[control] = controlErrors;
        }
      });
      return errors;
    }),
  );

  constructor(private paygatePopupService: PaygatePopupService,
              private authResourceService: AuthResourceService,
              private router: Router) {}

  submit() {
    Object.keys(this.form.controls).forEach(control => this.form.controls[control].markAsDirty());
    this.passwordError$.next({});

    if (this.form.valid) {
      const { new_password, repeat } = this.form.value;

      if (new_password === repeat) {
        this.paygatePopupService.activation$.pipe(
          take(1),
          switchMap((activation) => {
            if (activation) {
              return this.authResourceService.passwordResetConfirm({
                uid: activation.uid,
                token: activation.token,
                new_password,
              });
            } else {
              return  throwError({ error: ['Invalid activation data'], });
            }
          })).subscribe(() => {
            if (this.embedded) {
              this.success.emit(true);
            } else {
              this.paygatePopupService.navigateNextStep('password');
            }
          }, ({ error }) => {
            this.passwordError$.next(error);
          });
      } else {
        this.passwordError$.next({ repeat: ['passwords doesn\'t match'], });
      }
    }
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }
}
