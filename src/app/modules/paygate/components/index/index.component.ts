import { AfterViewInit, Component, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PaygatePopupService } from '../../services/paygate-popup.service';
import { LoginComponent } from '@app/modules/paygate/components/login/login.component';
import { RecoverComponent } from '@app/modules/paygate/components/recover/recover.component';
import { FideFormComponent } from '@app/modules/paygate/components/fide/fide.component';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'wc-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {
  plan$ = this.paygatePopupService.plan$;

  mobileShowForm = false;
  savedMobileShowForm = false;
  activatedComponent: any;

  destroy = new Subject();

  constructor(
    private paygatePopupService: PaygatePopupService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.router.events
        .pipe(
          filter(event => event instanceof NavigationStart || event instanceof NavigationEnd),
          takeUntil(this.destroy),
        ).subscribe((event) => {
          if (event instanceof NavigationStart) {
            this.savedMobileShowForm = this.mobileShowForm;
          } else {
            if (this.savedMobileShowForm && !this.mobileShowForm) {
              this.mobileShowForm = true;
            }
          }
        });
  }

  ngAfterViewInit(): void {
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.activatedComponent &&
      (
        this.activatedComponent instanceof LoginComponent ||
        this.activatedComponent instanceof RecoverComponent ||
        this.activatedComponent instanceof FideFormComponent
      )
    ) {
      this.hideLogoOnMobileLogin();
    } else {
      this.mobileShowForm = false;
    }
  }

  onActivate(component) {
    this.activatedComponent = component;
    if ((
      this.activatedComponent instanceof LoginComponent ||
      this.activatedComponent instanceof RecoverComponent ||
      this.activatedComponent instanceof FideFormComponent
    )) {
      this.hideLogoOnMobileLogin();
    } else {
      this.mobileShowForm = false;
    }
  }

  onDeactivate(component) {
    this.activatedComponent = null;
    if ((
      component instanceof LoginComponent ||
      component instanceof RecoverComponent ||
      component instanceof FideFormComponent
    )) {
      this.hideLogoOnMobileLogin();
    } else {
      this.mobileShowForm = false;
    }
  }

  hideLogoOnMobileLogin() {
    this.mobileShowForm = this.mobileShowForm ? this.mobileShowForm : window.outerWidth <= 768;
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
  }
}
