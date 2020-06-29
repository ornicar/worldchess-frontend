import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { takeUntil } from 'rxjs/operators';
import { NgOnDestroy } from '@app/shared/decorators/on-destroy';

enum RecoveryState {
  RECOVERY,
  CONFIRM,
  RESET,
}

@Component({
  selector: 'wc-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss']
})
export class RecoverComponent {

  recoveryError$ = new BehaviorSubject({});
  recoveryState$ = new BehaviorSubject<RecoveryState>(RecoveryState.RECOVERY);

  RecoveryState = RecoveryState;

  recoveryForm = new FormGroup({
    email: new FormControl('', [ Validators.required, Validators.email ]),
  });

  @NgOnDestroy() destroy$: Observable<void>;

  constructor(private http: HttpClient,
    private router: Router,
    private paygatePopupService: PaygatePopupService) {

    this.recoveryForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.recoveryError$.next({});
    });
  }

  recover() {
    if (this.recoveryForm.valid) {
      const email = this.recoveryForm.value.email;
      const params = new HttpParams().set('email', email.toLowerCase());
      this.http.get(`${environment.endpoint}/auth/users/activation-code/`, { params }).subscribe(() => {
        this.paygatePopupService.email$.next(email.toLowerCase());
        window['dataLayerPush']('wchLogin', 'Recovery', 'Recovery confirm', 'click', null, null);
        this.recoveryState$.next(RecoveryState.CONFIRM);
      }, error => {
        if (error && error.status === 404) {
          this.recoveryError$.next({ email: ['This e-mail is not registered'] });
        }
      });
    } else {
      this.recoveryError$.next({ email: ['Email is invalid'] });
    }
  }

  confirm(success) {
    if (success) {
      window['dataLayerPush']('wchLogin', 'Recovery', 'Code confirm', 'click', null, null);
      this.recoveryState$.next(RecoveryState.RESET);
    }
  }

  reset(success) {
    if (success) {
      window['dataLayerPush']('wchLogin', 'Recovery', 'Password confirm', 'click', null, null);
      this.router.navigate(['', { outlets: { p: ['paygate', 'login'] } }]);
    }
  }

  goToRecovery() {
    this.paygatePopupService.reset();
    this.recoveryState$.next(RecoveryState.RECOVERY);
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }
}

