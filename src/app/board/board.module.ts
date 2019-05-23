import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BoardSocketModule} from './board-socket/board-socket.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BoardSocketModule
  ],
  exports: [
    BoardSocketModule
  ]
})
export class BoardModule { }
