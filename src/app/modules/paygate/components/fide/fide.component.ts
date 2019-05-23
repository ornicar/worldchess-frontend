import { Component, ChangeDetectorRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, of, Observable, interval } from 'rxjs';
import { take, map, merge, delay } from 'rxjs/operators';
import * as moment from 'moment';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'wc-fide',
  templateUrl: './fide.component.html',
  styleUrls: ['./fide.component.scss'],
})
export class FideFormComponent implements OnInit {

  @ViewChild('birthdate_day') birthdateDay: ElementRef;
  @ViewChild('birthdate_month') birthdateMonth: ElementRef;
  @ViewChild('birthdate_year') birthdateYear: ElementRef;

  fideError$ = new BehaviorSubject<{ [key: string]: string[] }>({});
  countries$ = this.paygatePopupService.countries$.pipe(
    map(countries => countries ? countries.map(c => ({ label: c.name, value: c.id })) : null),
  );

  form = new FormGroup({
    step1: new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      fide_id: new FormControl(''),
      date_of_birth: new FormControl(null, [Validators.required]),
      gender: new FormControl('female', [Validators.required]),
      place_of_birth: new FormControl(null, [Validators.required]),
      nationality: new FormControl(null, [Validators.required]),
    }),

    step2: new FormGroup({
      federation: new FormControl(null, [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      photo: new FormControl(null, [Validators.required]),
    }),
  });

  formErrors$ = this.form.valueChanges.pipe(
    merge(this.fideError$),
    map(() => {
      const responseErrors = this.fideError$.getValue();
      const errors = {};
      const formControls = Object.values(this.form.controls)
        .reduce((result, fg: FormGroup) => Object.assign(result, fg.controls), {});
      Object.keys(formControls).forEach((control) => {
        if (formControls[control].touched) {
          const controlErrors = {
            ...formControls[control].errors,
            ...(responseErrors[control] && responseErrors[control].length ? { response: responseErrors[control][0] } : {})
          };
          errors[control] = controlErrors;
        }
      });
      return errors;
    }),
  );

  step = 1;
  preview = null;

  constructor(private paygatePopupService: PaygatePopupService,
              private router: Router,
              private cd: ChangeDetectorRef,
              private http: HttpClient,
              ) {}

  ngOnInit() {
    // TODO kostyl' ebanii
    setTimeout(() => {
      this.http.get(`${environment.endpoint}/me/`)
          .subscribe((me) => {
            this.form.controls['step2']['controls']['email'].patchValue(me['email']);
          });
    }, 2000);
  }

  onFileChanged(event) {
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.form.get('step2.photo').patchValue(reader.result);
        this.preview = reader.result;
      };
    }
  }

  onDateChanged() {
    const day = this.birthdateDay.nativeElement.value;
    const month = this.birthdateMonth.nativeElement.value;
    const year = this.birthdateYear.nativeElement.value;
    const date = moment(`${month}-${day}-${year}`, 'MM-DD-YYYY', true);
    if (date.isValid()) {
      this.form.get('step1.date_of_birth').patchValue(date.format('YYYY-MM-DD'));
      const fideErrors = this.fideError$.getValue();
      delete fideErrors.date_of_birth;
      this.fideError$.next(fideErrors);
    } else {
      this.form.get('step1.date_of_birth').patchValue(null);
      this.fideError$.next({ date_of_birth: ['Invalid date']});
    }
  }

  private forceMarkTouched(formName: string) {
    const form = <FormGroup>this.form.get(formName);
    Object.values(form.controls).forEach(control => control.markAsTouched({ onlySelf: true }));
  }

  goToStep(step: 1 | 2) {
    this.forceMarkTouched(`step${this.step}`);
    if (this.form.controls[`step${this.step}`].invalid) {
      return;
    }

    this.step = step;
  }

  submit() {
    Object.values(this.form.controls).forEach((fg: FormGroup) => {
      Object.values(fg.controls).forEach(control => control.markAsTouched({ onlySelf: true }));
    });

    this.fideError$.next({});

    if (this.form.valid) {
      const data = Object.values(this.form.controls).reduce((result, fg) => Object.assign(result, fg.value), {});
      if (data.fide_id === '') {
        delete data.fide_id;
      } else {
        data.fide_id = +data.fide_id;
      }
      this.paygatePopupService.submitFide(data).pipe(
        take(1),
      ).subscribe(() => {
        this.paygatePopupService.navigateNextStep('fide');
      }, ({ error }) => {
        this.fideError$.next(error);
      });
    } else {
      this.fideError$.next({ error: ['Invalid data'] });
    }
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }
}
