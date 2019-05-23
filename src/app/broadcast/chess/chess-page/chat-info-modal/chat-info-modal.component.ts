import {Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {ScreenStateService} from '../../../../shared/screen/screen-state.service';
import * as fromBoard from '../../../core/board/board.reducer';
import {GameCloseChatInfoModal, ChatInfoModalTypes} from '../game/game.actions';
import {selectChatInfoModalDetail, selectChatInfoModalType} from '../game/game.reducer';

@Component({
  selector: 'wc-chat-info-modal',
  templateUrl: './chat-info-modal.component.html',
  styleUrls: ['./chat-info-modal.component.scss']
})
export class ChatInfoModalComponent implements OnInit, OnDestroy {

  public detail$ = this.store$.pipe(
    select(selectChatInfoModalDetail)
  );

  public type$ = this.store$.pipe(
    select(selectChatInfoModalType)
  );

  public ChatInfoModalTypes = ChatInfoModalTypes;

  constructor(
    private store$: Store<fromBoard.State>,
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
    this.store$.dispatch(new GameCloseChatInfoModal());
  }
}
