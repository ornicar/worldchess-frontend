import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { WidgetPageComponent } from './pages/widget-page/widget-page.component';

export const routes: Routes = [
  {
    path: 'widget/:uuid',
    component: WidgetPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WidgetRoutingModule {
}
