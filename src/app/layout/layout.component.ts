import { Component, Input } from '@angular/core';

@Component({
  selector: 'wc-layout',
  template: `
    <app-nav>
      <wc-main-broadcast-nav
        [compact]="true"
        mobile-content
      ></wc-main-broadcast-nav>
    </app-nav>
    <ng-content></ng-content>
    <app-footer [sponsorsVisible]="showSponsorsAtFooter"></app-footer>
  `,
  styles: [` :host { display: flex; flex-direction: column; }`]
})
export class LayoutComponent {
  @Input() showSponsorsAtFooter = true;
}
