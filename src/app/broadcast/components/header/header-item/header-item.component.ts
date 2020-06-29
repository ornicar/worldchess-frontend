import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'wc-header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.scss']
})
export class HeaderItemComponent {
  @Input() name: string;

  @Input() selected: any;

  @ContentChild('titleSelected', { read: TemplateRef, static: true }) titleSelectedTemplate;

  @Output() onClick = new EventEmitter();
}
