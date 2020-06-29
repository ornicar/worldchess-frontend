import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[target_component]'
})
export class MpHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
