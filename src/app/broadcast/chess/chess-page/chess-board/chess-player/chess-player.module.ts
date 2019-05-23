import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../../../shared/shared.module';
import {ChessPlayerComponent} from './chess-player.component';
import {FullNameCutNamePipe} from './fullname-cut-name.pipe';
import {MoveTimerComponent} from './move-timer/move-timer.component';
import { ChessPlayerResultComponent } from './chess-player-result/chess-player-result.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    MoveTimerComponent,
    ChessPlayerComponent,
    FullNameCutNamePipe,
    ChessPlayerResultComponent
  ],
  exports: [
    MoveTimerComponent,
    ChessPlayerComponent,
    FullNameCutNamePipe,
    ChessPlayerResultComponent
  ]
})
export class ChessPlayerModule { }
