import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BoardSocketService} from './board-socket.service';

@NgModule({
  declarations: [],
  providers: [
    BoardSocketService
  ],
  imports: [
    CommonModule,
  ]
})
export class BoardSocketModule { }
