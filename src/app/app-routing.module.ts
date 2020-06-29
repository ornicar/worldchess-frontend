import { Component, HostListener, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WidgetPageComponent } from '../widget/app/pages/widget-page/widget-page.component';
import { IsAuthorizedGuard } from './auth/is-authorized.guard';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { PartnershipPageComponent } from './pages/partnership-page/partnership/partnership-page.component';
import { RbccPageComponent } from './pages/partnership-page/rbcc/rbcc-page.component';
import { WidgetsListPageComponent } from './pages/widgets-list-page/widgets-list-page.component';

@Component({
  template: '<router-outlet (activate)="onActivate($event)" (deactivate)="onDeactivate()"></router-outlet>',
})
export class EmptyOutletComponent {

  activeComponent: any;
  body = document.getElementsByTagName('body')[0];
  locked = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.lock();
  }

  lock() {
    if (this.locked) {
      this.body.classList.add('fix');
    } else {
      this.body.classList.remove('fix');
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
    path: 'main-old',
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
    path: 'news',
    loadChildren: './modules/news/news.module#NewsModule',
  },
  {
    path: 'armageddon',
    loadChildren: './modules/news/news.module#NewsModule',
  },
  {
    path: 'london',
    redirectTo: '/tournament/london',
  },
  {
    path: 'widget/:uuid',
    component: WidgetPageComponent
  },
  {
    path: 'arena',
    loadChildren: './modules/game/game.module#GameModule',
  },
  {
    path: '',
    loadChildren: './modules/main/main.module#MainModule',
  },
  {
    path: 'watch',
    loadChildren: './modules/watch/watch.module#WatchModule',
  },
  {
    path: 'ratings',
    loadChildren: './modules/rating/rating.module#RatingModule',
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
