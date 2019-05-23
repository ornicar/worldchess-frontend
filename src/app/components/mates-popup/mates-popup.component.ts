import {Component, OnInit} from '@angular/core';
import {UserService} from '../../client/user.service';

@Component({
  selector: 'wc-mates-popup',
  templateUrl: './mates-popup.component.html',
  styleUrls: ['./mates-popup.component.scss']
})
export class MatesPopupComponent implements OnInit {

  public showPopup = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.showPopup = this.userService.isFirstVisit();
    if (this.showPopup) {
      this.userService.saveFirstVisit();
    }
  }

  close() {
    this.showPopup = false;
  }
}
