import {Injectable} from '@angular/core';



import {Subject} from 'rxjs';
import {UserInfo} from './user-access/dto/response/user-info';

@Injectable()
export class NavObserver {

  private emitChangeAuth = new Subject<UserInfo>();

  changeAuth = this.emitChangeAuth.asObservable();

  emitAuthChange(userInfo: UserInfo) {
    this.emitChangeAuth.next(userInfo);
  }

}
