import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HideScrollbarDirective} from './hide-scrollbar.directive';
import { ClickOutsideDirective } from './click-outside.directive';
import {InsideScrollAreaDirective} from './intersection-with-scroll-area.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    HideScrollbarDirective,
    ClickOutsideDirective,
    InsideScrollAreaDirective
  ],
  exports: [
    HideScrollbarDirective,
    ClickOutsideDirective,
    InsideScrollAreaDirective
  ]
})
export class DirectivesModule { }
