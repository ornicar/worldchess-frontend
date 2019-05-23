import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PaygatePopupService } from '../../services/paygate-popup.service';

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

  constructor(private http: HttpClient,
    private router: Router,
    private paygatePopupService: PaygatePopupService) { }

  recover() {
    if (this.recoveryForm.valid) {
      const email = this.recoveryForm.value.email;
      const params = new HttpParams().set('email', email);
      this.http.get(`${environment.endpoint}/auth/users/activation-code/`, { params }).subscribe(() => {
        this.paygatePopupService.email$.next(email);
        this.recoveryState$.next(RecoveryState.CONFIRM);
      }, error => {
        this.recoveryError$.next(error);
      });
    } else {
      this.recoveryError$.next({ email: ['Email is invalid'] });
    }
  }

  confirm(success) {
    if (success) {
      this.recoveryState$.next(RecoveryState.RESET);
    }
  }

  reset(success) {
    if (success) {
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

