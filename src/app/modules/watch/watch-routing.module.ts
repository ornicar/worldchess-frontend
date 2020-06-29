import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {SvgModule} from "@app/modules/svg/svg.module";
import {MainPageComponent} from "@app/modules/main/components/main-page/main-page.component";
import {WatchPageComponent} from "@app/modules/watch/watch-page/watch-page.component";

const routes: Routes = [
  {
    path: '',
    component: WatchPageComponent,
    canDeactivate: [
    ]
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SvgModule,
  ],
  exports: [RouterModule]
})
export class WatchRoutingModule { }
