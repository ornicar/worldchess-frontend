import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {

  mobileShowForm = false;
  savedMobileShowForm = false;
  activatedComponent: any;

  destroy = new Subject();

  constructor(
    private paygatePopupService: PaygatePopupService,
    private cd: ChangeDetectorRef,
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
              this.cd.markForCheck();
            }
          }
        });
  }

  ngAfterViewInit(): void {
    this.mobileShowForm = true;
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
      this.cd.markForCheck();
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
      this.cd.markForCheck();
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
      this.cd.markForCheck();
    }
  }

  hideLogoOnMobileLogin() {
    this.mobileShowForm = this.mobileShowForm ? this.mobileShowForm : window.outerWidth <= 768;
    this.cd.markForCheck();
  }

  closePopup() {
    this.paygatePopupService.closePopup();
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
  }
}
