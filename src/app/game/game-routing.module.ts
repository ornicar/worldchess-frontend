import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { GamePageComponent } from './game-page/game-page.component';
import { LeaveGameGuard } from './guards/leave-game.guard';

const routes: Routes = [
  {
    path: '',
    component: GamePageComponent,
    canDeactivate: [
      LeaveGameGuard,
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
