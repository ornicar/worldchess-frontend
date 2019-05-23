import {Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { DomHelper } from '@app/shared/helpers/dom.helper';
// import {DomHelper} from 'app/shared/helpers/dom.helper';

@Directive({
  selector: '[wcAdjustOverflowHidden]'
})
export class AdjustOverflowHiddenDirective implements OnInit, OnChanges {
  @Input() wcAdjustOverflowHidden: boolean;
  containerElement: any;

  config = {
    parentClass: 'prediction__list',
    maxOffset: 200
  };

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.containerElement = DomHelper.findParentByClass(this.elementRef.nativeElement, this.config.parentClass);
  }

  ngOnChanges(changes: SimpleChanges) {
    const trigger = changes.wcAdjustOverflowHidden;
    if (trigger.currentValue && !trigger.firstChange && trigger.currentValue !== trigger.previousValue) {
      let limit =  this.containerElement.offsetWidth / 4;
      limit = limit > this.config.maxOffset ? this.config.maxOffset : limit;

      const contRect = this.containerElement.getBoundingClientRect();
      const elemRect = this.elementRef.nativeElement.getBoundingClientRect();

      const scrollRight = limit - (contRect.right - elemRect.right);
      if (scrollRight > 0) {
        this.containerElement.scrollLeft = this.containerElement.scrollLeft + scrollRight;
      }

      const scrollLeft = limit - (elemRect.left - contRect.left);
      if (scrollLeft > 0) {
        this.containerElement.scrollLeft = this.containerElement.scrollLeft - scrollLeft;
      }
    }
  }
}
