import { Component, OnInit, Input } from '@angular/core';
import { IWidget } from '../../services/widget.service';

@Component({
  selector: 'wc-widget-footer',
  templateUrl: './widget-footer.component.html',
  styleUrls: ['./widget-footer.component.scss']
})
export class WidgetFooterComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
