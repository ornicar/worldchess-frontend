import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HideScrollbarDirective } from './hide-scrollbar.directive';
import { ClickOutsideDirective } from './click-outside.directive';
import { InsideScrollAreaDirective } from './intersection-with-scroll-area.directive';
import { DisableControlDirective } from '@app/shared/directives/disabled.directive';
import { TouchDirective } from '@app/shared/directives/touch.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    HideScrollbarDirective,
    ClickOutsideDirective,
    InsideScrollAreaDirective,
    DisableControlDirective,
    TouchDirective
  ],
  exports: [
    HideScrollbarDirective,
    ClickOutsideDirective,
    InsideScrollAreaDirective,
    DisableControlDirective,
    TouchDirective
  ]
})
export class DirectivesModule { }
