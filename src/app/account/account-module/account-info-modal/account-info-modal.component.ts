import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ScreenStateService } from '../../../shared/screen/screen-state.service';
import { CloseWannaBeOrgModal } from '../../account-store/account.actions';
import * as fromRoot from '../../../reducers';

@Component({
  selector: 'wc-account-info-modal',
  templateUrl: './account-info-modal.component.html',
  styleUrls: ['./account-info-modal.component.scss']
})
export class AccountInfoModalComponent implements OnInit, OnDestroy {

  constructor(
    private store$: Store<fromRoot.State>,
    private screenService: ScreenStateService
  ) {
  }

  public ngOnInit() {
    this.screenService.lock();
  }

  public ngOnDestroy() {
    this.screenService.unlock();
  }

  public closeModal() {
    this.store$.dispatch(new CloseWannaBeOrgModal());
  }
}
