import { Component } from '@angular/core';

@Component({
  selector: 'wc-paygate-debug',
  template: `
    <div class="wc-paygate-debug">
      <a [routerLink]="['', { outlets: { p: ['paygate', 'password'] } }]" fragment="pro">Password confirm</a>
      <a [routerLink]="['', { outlets: { p: ['paygate', 'success'] } }]">Congratulations</a>
      <a [routerLink]="['', { outlets: { p: ['paygate', 'payment'] } }]" fragment="pro">Payment</a>
      <a [routerLink]="['', { outlets: { p: ['paygate', 'fide'] } }]">Fide</a>
      <a [routerLink]="['', { outlets: { p: ['paygate', 'confirm'] } }]" fragment="pro">Confirm</a>
      <a [routerLink]="['', { outlets: { p: ['paygate', 'purchase'] } }]" fragment="tournament">Buy tournament</a>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1000;
      }

      .wc-paygate-debug a {
        margin-right: 18px;
        color: red;
      }
    `,
  ],
})
export class PaygateDebugComponent {}
