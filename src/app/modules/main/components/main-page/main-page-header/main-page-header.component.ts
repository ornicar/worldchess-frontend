import {Component, Input, OnInit} from '@angular/core';
import {HolderItem} from "@app/modules/main/components/main-page/holder-item";
import { Router } from '@angular/router';
@Component({
  selector: 'main-page-header',
  templateUrl: './main-page-header.component.html',
  styleUrls: ['./main-page-header.component.scss']
})
export class MainPageHeaderComponent implements OnInit {

  constructor(
    private route: Router
  ) { }

  @Input()
  item: HolderItem;

  @Input()
  barItem: HolderItem;

  isOpened: boolean = false;

  

  ngOnInit() {
  }


  toggleOpenClose(event){
    this.isOpened = !this.isOpened;
  }

  goToMainPage($event) {
    $event.preventDefault();
    this.route.navigate(['/arena']).then();
  }

  goToWatch($event) {
    $event.preventDefault();
    this.route.navigate(['/watch']).then();   
  }
}
