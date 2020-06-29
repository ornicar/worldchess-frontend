import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-main-page-footer',
  templateUrl: './main-page-footer.component.html',
  styleUrls: ['./main-page-footer.component.scss']
})
export class MainPageFooterComponent implements OnInit {

  window = window;

  selectLanguage =  false;

  constructor(
  ) { }

  ngOnInit() {
  }

}
