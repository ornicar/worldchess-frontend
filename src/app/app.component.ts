import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {Angulartics2GoogleTagManager} from 'angulartics2/gtm';
import {ScreenStateService} from './shared/screen/screen-state.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'app';

  _showNav = new BehaviorSubject(false);
  showNav$ = this._showNav.asObservable();

  constructor(
    angulartics2GoogleTagManager: Angulartics2GoogleTagManager,
    matIconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private screenState: ScreenStateService,
    private elementRef: ElementRef
  ) {

    matIconRegistry
      .addSvgIcon('visibility',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/visibility.svg'))
      .addSvgIcon('visibility_off',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/visibility_off.svg'))
      .addSvgIcon('input_success',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/success.svg'))
      .addSvgIcon('input_error',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/error.svg'))
      .addSvgIcon('non_edit',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/edit-icon_no.svg'))
      .addSvgIcon('edit',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/edited-icon_yes.svg'));
  }

  ngAfterViewInit() {
    // Initialize screen locker with root element
    this.screenState.initialize(this.elementRef.nativeElement);
  }

  onActivate($event) {
    if ($event.showMainNav === true) {
      this._showNav.next(true);
    }
  }

  onDeactivate($event) {
    this._showNav.next(false);
  }

  onActivatePopup($event) {
  }

  onDeactivatePopup($event) {
  }
}
