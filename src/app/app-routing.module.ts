import { Component, HostListener, Injectable, NgModule } from '@angular/core';
import { CanLoad, Route, RouterModule, Routes, UrlSegment } from '@angular/router';
import { WidgetPageComponent } from '../widget/app/pages/widget-page/widget-page.component';
import { IsAuthorizedGuard } from './auth/is-authorized.guard';
import { IsNotAuthorizedGuard } from './auth/is-not-authorized.guard';
import { NewsGroupComponent } from './news/news-group/news-group.component';
import { NewsViewComponent } from './news/news-view/news-view.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { PartnershipPageComponent } from './pages/partnership-page/partnership/partnership-page.component';
import { RbccPageComponent } from './pages/partnership-page/rbcc/rbcc-page.component';
import { WidgetsListPageComponent } from './pages/widgets-list-page/widgets-list-page.component';
import { PaygatePageComponent } from './paygate/paygate-page.component';
import {TvViewComponent} from './tv-view/tv-view.component';
import { AccountActivateComponent } from './user-access/account-activate/account-activate.component';
import { AccountRestoreComponent } from './user-access/account-restore/account-restore.component';
import { RestoreComponent } from './user-access/restore/restore.component';
import { SignInComponent } from './user-access/sign-in/sign-in.component';
import { SignUpComponent } from './user-access/sign-up/sign-up.component';
import { SocialSignInComponent } from './user-access/social-sign-in/social-sign-in.component';
import { WelcomePageComponent } from './user-access/welcome-page/welcome-page.component';
import { AuthRouteInterceptor } from './auth/auth-route-interceptor';
import { routingRating } from './pages/rating-page/rating.module';
import { ArmageddonViewComponent } from './armageddon-view/armageddon-view.component';


@Component({
  template: '<router-outlet (activate)="onActivate($event)" (deactivate)="onDeactivate()"></router-outlet>',
})
export class EmptyOutletComponent {

  activeComponent: any;
  body = document.getElementsByTagName('body')[0];
  locked = false;
  freezeVp = (e) => e.preventDefault();

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.lock();
  }

  lock() {
    if (this.locked) {
      this.body.classList.add('fix');
      // document.body.addEventListener('touchmove', this.freezeVp, {passive: false} as EventListenerOptions);
      // document.body.addEventListener('ontouchend', this.freezeVp, false);
      // document.body.addEventListener('ontouchstart', this.freezeVp, false);
      // document.ontouchmove = this.freezeVp;
      // const vpH = window.innerHeight;
      // document.documentElement.style.height = vpH.toString() + 'px';
      // this.body['style'].height = vpH.toString() + 'px';
    } else {
      this.body.classList.remove('fix');
      // document.body.removeEventListener('touchmove', this.freezeVp, {passive: false} as EventListenerOptions);
      // document.body.removeEventListener('ontouchend', this.freezeVp, false);
      // document.body.removeEventListener('ontouchstart', this.freezeVp, false);
      // document.ontouchmove = () => true;
      // document.documentElement.style.height = null;
      // this.body['style'].height = null;
    }
  }

  onActivate($event) {
    this.activeComponent = $event;
    this.locked = true;
    this.lock();
  }

  onDeactivate() {
    this.activeComponent = null;
    this.locked = false;
    this.lock();
  }
}

export const routes: Routes = [
  {
    path: '',
    component: MainPageComponent
  },
  {
    path: 'account',
    canActivate: [
      IsAuthorizedGuard
    ],
    loadChildren: './account/account-module/account.module#AccountModule',
  },
  {
    path: 'partnership',
    component: PartnershipPageComponent
  },
  {
    path: 'widgets',
    component: WidgetsListPageComponent
  },
  {
    path: 'partnership/rbcc',
    component: RbccPageComponent
  },
  {
    path: 'sign-up',
    canActivate: [
      IsNotAuthorizedGuard
    ],
    component: SignUpComponent
  },
  {
    path: 'sign-in',
    canActivate: [
      IsNotAuthorizedGuard,
      AuthRouteInterceptor
    ],
    component: SignInComponent
  },
  {
    path: 'verify/:social',
    component: SocialSignInComponent
  },
  {
    path: 'activate/:uid/:token',
    component: AccountActivateComponent
  },
  {
    path: 'restore',
    canActivate: [
      IsNotAuthorizedGuard
    ],
    component: RestoreComponent
  },
  {
    path: 'password-reset/:uid/:token',
    canActivate: [
      IsNotAuthorizedGuard
    ],
    component: AccountRestoreComponent
  },
  {
    path: 'welcome',
    canActivate: [
      IsAuthorizedGuard
    ],
    component: WelcomePageComponent
  },
  {
    path: 'news',
    component: NewsGroupComponent
  },
  {
    path: 'news/:id',
    component: NewsViewComponent
  },
  {
    path: 'armageddon',
    component: ArmageddonViewComponent
  },
  {
    path: 'tv',
    component: TvViewComponent
  },
  {
    path: 'london',
    redirectTo: '/tournament/london',
  },
  // @todo. fix
  ...routingRating,
  {
    path: 'widget/:uuid',
    component: WidgetPageComponent
  },
  {
    path: 'arena',
    loadChildren: './game/game.module#GameModule',
  },
  {
    path: 'not-found',
    loadChildren: './modules/not-found-page/not-found-page.module#NotFoundPageModule',
  },
  {
    path: '',
    outlet: 'p',
    component: EmptyOutletComponent,
    children: [
      {
        path: 'paygate',
        pathMatch: 'prefix',
        loadChildren: './modules/paygate/paygate.module#PaygateModule',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [EmptyOutletComponent],
})
export class AppRoutingModule {
}
