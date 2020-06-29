import { Directive, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, interval, Observable, pipe } from 'rxjs';
import { filter, finalize, map, takeWhile } from 'rxjs/operators';
import { NgControl } from '@angular/forms';
import { PaygateFormControl } from '@app/modules/paygate/_shared/paygate-form-control.class';

@Directive({
  selector: '[paygateFormControl]',
  exportAs: 'paygateFormControl',
})
export class PaygateFormControlDirective implements OnInit {

  private paygateFormControl: PaygateFormControl;

  constructor(
    private el: ElementRef,
    private control: NgControl,
  ) {

  }

  ngOnInit() {
    this.paygateFormControl = this.control.control as PaygateFormControl;
  }

  @HostListener('input')
  onInput() {
    this.paygateFormControl.input$.next(true);
  }

  @HostListener('blur', ['$event'])
  onBlur(event?: MouseEvent) {
    this.paygateFormControl.input$.next(false);
  }
}
