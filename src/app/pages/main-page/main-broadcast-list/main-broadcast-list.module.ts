import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainBroadcastListComponent } from './main-broadcast-list.component';
import { ComponentsModule } from '../../../components/components.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    RouterModule,
  ],
  declarations: [
    MainBroadcastListComponent,
  ],
  exports: [
    MainBroadcastListComponent,
  ]
})
export class MainBroadcastListModule { }
