import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {AuthLogout} from '../../auth/auth.actions';
import {IProfile} from '../../auth/auth.model';
import * as forRoot from '../../reducers/index';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  @Input() userInfo: IProfile;
  @Output() onClickLink = new EventEmitter();

  constructor(private store$: Store<forRoot.State>, private elementRef: ElementRef) { }

  ngOnInit() {}

  logout() {
    this.store$.dispatch(new AuthLogout());
  }
}
