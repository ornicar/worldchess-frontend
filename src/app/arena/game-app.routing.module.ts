import { Component, HostListener, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
    path: '',
    loadChildren: '../modules/game/game.module#GameModule',
  },
  {
    path: '',
    outlet: 'p',
    component: EmptyOutletComponent,
    children: [
      {
        path: 'paygate',
        pathMatch: 'prefix',
        loadChildren: '../modules/paygate/paygate.module#PaygateModule',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [EmptyOutletComponent],
})
export class GameAppRoutingModule {
}
