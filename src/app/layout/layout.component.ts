import { Component, Input } from '@angular/core';

@Component({
  selector: 'wc-layout',
  template: `
    <app-nav></app-nav>
    <ng-content></ng-content>
    <app-footer [sponsorsVisible]="showSponsorsAtFooter"></app-footer>
  `,
  styles: [` :host { display: block; }`]
})
export class LayoutComponent {
  @Input() showSponsorsAtFooter = true;
}
