import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ScreenStateService } from '../../shared/screen/screen-state.service';
import { BehaviorSubject } from 'rxjs';
import { Router, ResolveStart, ResolveEnd, NavigationEnd, NavigationStart } from '@angular/router';
import { filter, first, map, withLatestFrom } from 'rxjs/operators';
import { AuthLogout, AuthSetToken } from '@app/auth/auth.actions';
import { selectToken, selectRefreshLoading } from '@app/auth/auth.reducer';
import { environment } from '../../../environments/environment';
import { Store, select, createSelector } from '@ngrx/store';
import * as forRoot from '@app/reducers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './game-app.component.html',
  styleUrls: ['./game-app.component.scss']
})
export class GameAppComponent implements AfterViewInit {
  title = 'app';

  _showNav = new BehaviorSubject(false);
  showNav$ = this._showNav.asObservable();

  private _applicationUrl = environment['applicationUrl'];
  private _gameUrl = environment['gameUrl'];

  private _token$ = this.store$.pipe(
    select(selectToken),
    map(t => t ? '?t=' + t : ''),
  );

  public preloader: boolean;

  constructor(
    matIconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private screenState: ScreenStateService,
    private elementRef: ElementRef,
    private router: Router,
    private store$: Store<forRoot.State>,
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
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/edited-icon_yes.svg'))
      .addSvgIcon('lock',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/lock.svg'));

    this.router.events.pipe(
      filter(event => event instanceof ResolveStart)
    ).subscribe(data => this.preloader = true);

    this.router.events.pipe(
      filter(event => event instanceof ResolveEnd)
    ).subscribe(data => this.preloader = false);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(data => window.scrollTo(0, 0));

    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      map((e: NavigationStart) => e['url']),
      withLatestFrom(this._token$),
    ).subscribe(([url, token]) => {
      const match = /\?t=(.*)$/.exec(url);

      if (match) {
        const __token: string = match[1];
        this.store$.dispatch(new AuthSetToken({ token: __token }));
        this.router.navigateByUrl(url.replace(/(\?.*)/, '')).then();
      }
    });
  }

  ngAfterViewInit() {
    // Initialize screen locker with root element
    this.screenState.initialize(this.elementRef.nativeElement);
    (<any>window).Intercom('boot', {
      app_id: 'krpcser0',
    });
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
