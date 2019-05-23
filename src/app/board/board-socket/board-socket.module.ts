import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthModule} from '../../auth/auth.module';
import {BoardSocketService} from './board-socket.service';

@NgModule({
  declarations: [],
  providers: [
    BoardSocketService
  ],
  imports: [
    CommonModule,
    AuthModule
  ]
})
export class BoardSocketModule { }
