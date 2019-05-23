import { Component, OnInit, Input } from '@angular/core';
import { IWidget } from '../../services/widget.service';

@Component({
  selector: 'wc-widget-header',
  templateUrl: './widget-header.component.html',
  styleUrls: ['./widget-header.component.scss']
})
export class WidgetHeaderComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
