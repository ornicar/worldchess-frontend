import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, merge, finalize, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { AuthResourceService } from '../../../../auth/auth-resource.service';
import * as fromRoot from '../../../../reducers';
import { AuthSetTokenDirty } from '../../../../auth/auth.actions';


@Component({
  selector: 'wc-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private registerError$ = new BehaviorSubject<{ [key: string]: string[] }>({});

  form = new FormGroup({
    full_name: new FormControl('', [
      Validators.required,
    ]),
    email: new FormControl('', [
      Validators.email,
      Validators.required,
    ]),
  });

  formErrors$ = this.form.valueChanges.pipe(
    merge(this.registerError$),
    map(() => {
      const responseErrors = this.registerError$.getValue();
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

  loading$ = new BehaviorSubject<boolean>(false);

  product$ = this.paygatePopupService.products$;

  constructor(private paygatePopupService: PaygatePopupService,
              private store$: Store<fromRoot.State>,
              private authResource: AuthResourceService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((queryParams) => {
      if (!this.activatedRoute.snapshot.fragment) {
        this.router.navigate([], {fragment: 'basic', queryParams });
      }
    });
  }

  submit() {
    Object.values(this.form.controls).forEach(control => control.markAsDirty());
    this.registerError$.next({});

    if (this.form.valid) {
      const { full_name, email} = this.form.value;
      this.loading$.next(true);
      this.authResource.signUpCode({ full_name, email }).pipe(
        finalize(() => this.loading$.next(false)),
      ).subscribe(({ token }) => {
        this.paygatePopupService.email$.next(email);
        this.store$.dispatch(new AuthSetTokenDirty({ token }));
        this.paygatePopupService.navigateNextStep('register');
      }, ({ error }) => {
        this.registerError$.next(error);
      });
    } else {
      this.registerError$.next({
        'form': [
          'Invalid data',
        ],
      });
    }
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }

  goToLogin() {
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((queryParams) => {
      this.router.navigate(['', { outlets: { p: ['paygate', 'login'] } }], { queryParams });
    });
  }
}
