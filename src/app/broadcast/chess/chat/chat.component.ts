import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding, Input, OnChanges,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { IChatMessageLike } from '@app/board/board-socket/board-socket.model';
import * as fromRoot from '../../../reducers/index';
import * as fromAccount from '@app/account/account-store/account.reducer';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { GameOpenChatInfoModal, ChatInfoModalTypes } from '../chess-page/game/game.actions';
import { IChatMessage } from './chat-message/chat-message.component';
import { CommentsResourceService, IComment, ICommentParams, ICommentProfile } from './comments-resource.service';
import { delay, filter, map, switchMap, take } from 'rxjs/operators';
import { BoardStatus, IBoard } from '../../core/board/board.model';
import { of } from 'rxjs/internal/observable/of';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { BackLightReplyMessagePipe } from './backLightReplyMessage.pipe';
import { ChatSocketService } from './services/chat-socket.service';
import { IAccount } from '@app/account/account-store/account.model';
import { ITour, TourStatus } from '@app/broadcast/core/tour/tour.model';


const DELAY_LOCK_CHAT = moment.duration(5, 'h');
const MAX_WIDTH_SCREEN_LOCK = 768;
const MAX_MESSAGE_LENGTH = 150;

@Component({
  selector: 'wc-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
  public openPopup: Function; // needs to emodzi input
  public messagesSs: Subscription;
  public likesSs: Subscription;
  public boardSs: Subscription;
  public commentsSs: Subscription;
  public endGameSs: Subscription;

  public account$ = this.store$.pipe(
    select(fromAccount.selectMyAccount),
  );

  @Input() board: IBoard;
  @Input() tour: ITour;

  @OnChangesInputObservable('board')
  private selectedBoard$ = new BehaviorSubject<IBoard>(this.board);

  public chatLocked = false;
  public loadingHistory = false;
  public showFinishMessage = false;
  public tourIsNotStarted = true;

  public requests = [];
  public messages: IChatMessage[] = [];
  public messageText = '';
  public avatarColor = '';
  public account: IAccount;

  public get isAnonymous() {
    return !this.account;
  }

  private boards = [];  // array for multi-boarding
  private waitLike = [];  // array for like requests
  private limit = 100;
  private offset = 0;
  // private total = 0;
  private messagesFinished = false;
  private messageReplies: ICommentProfile[] = [];

  private shouldReturnScroll = false;
  private shouldScrollDown = false;
  private fromBottom = 0;
  private gameOver = false;

  private subs: Subscriptions = {};

  @ViewChild('messagesList', { static: true }) private messagesListComponent: ElementRef;
  @HostBinding('class.open-mobile') openMobileClass = false;

  focusInput = new BehaviorSubject<boolean>(null);

  constructor(
    private chatService: ChatSocketService,
    private commentService: CommentsResourceService,
    private store$: Store<fromRoot.State>,
    private cd: ChangeDetectorRef,
    private screenService: ScreenStateService,
  ) { }

  public ngOnInit() {
    this.subs.chatState = combineLatest(this.account$, this.selectedBoard$)
      .subscribe(([account, board]) => {
        this.account = account;
        this.updateChatLocked();

        if (board) {
          this.subscribeMessages([board.id], account);
        } else {
          this.unsubscribeChat();
        }

        this.cd.markForCheck();
      });

    this.avatarColor = this.getRandomBackgroundColor();
    this.boardSs = this.selectedBoard$
      .pipe(filter(board => Boolean(board)))
      .subscribe(board => {
        this.boards = [board.id];
        this.cd.markForCheck();
        this.subscribeEndGame();
      });
  }

  @OnChangesObservable()
  ngOnChanges() {
  }

  private unsubscribeChat() {
    if (this.messagesSs) {
      this.messagesSs.unsubscribe();
    }
    if (this.commentsSs) {
      this.commentsSs.unsubscribe();
    }
    if (this.endGameSs) {
      this.endGameSs.unsubscribe();
    }
    if (this.likesSs) {
      this.likesSs.unsubscribe();
    }
  }

  public ngOnDestroy() {
    this.boardSs.unsubscribe();
    this.screenService.unlock();
    this.unsubscribeChat();

    SubscriptionHelper.unsubscribe(this.subs);
  }

  public ngAfterViewChecked() {
    // Here we should perform scroll
    if (this.shouldReturnScroll) {
      this.shouldReturnScroll = false;
      this.messagesListComponent.nativeElement.scrollTop = this.messagesListComponent.nativeElement.scrollHeight
        - this.fromBottom;
    }

    if (this.shouldScrollDown) {
      this.shouldScrollDown = false;
      this.messagesListComponent.nativeElement.scrollTop = this.messagesListComponent.nativeElement.scrollHeight;
    }
    this.cd.markForCheck();
  }

  private scrollToBottomIfNeed() {
    if (this.needToScrollOnNewMessage()) {
      // scroll to bottom on the new message if user is on the bottom of the chat.
      // it will prevent scrolling to bottom if user is reading history
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  public subscribeMessages(boardIds: number[], account: IAccount) {
    this.messages = [];
    this.offset = 0;
    this.messagesFinished = false;

    if (this.messagesSs) {
      this.messagesSs.unsubscribe();
    }
    // @TODO subscribe on store
    this.messagesSs = this.chatService.messages$.pipe(
      map(({comments}) => comments.filter(comment => boardIds.includes(comment.board))),
      filter(comments => comments.length > 0)
    )
      .subscribe((comments: IComment[]) => {
        const messages = comments.map((comment: IComment): IChatMessage => ({
          ...comment,
          my: account && comment.user && account.id === comment.user.id
        }));

        this.messages.push(...messages);
        if (this.needToScrollOnNewMessage()) {
          // scroll to bottom on the new message if user is on the bottom of the chat.
          // it will prevent scrolling to bottom if user is reading history
          setTimeout(() => this.scrollToBottom(), 100);
        }
        this.scrollToBottomIfNeed();
        this.cd.markForCheck();
      });

    if (this.subs.messagesRemove) {
      this.subs.messagesRemove.unsubscribe();
    }

    // @TODO subscribe on store
    this.subs.messagesRemove = this.chatService.messagesRemove$
      .subscribe(({comment: id}) => {
        const index = this.messages.findIndex(msg => msg.id === id);

        if (index !== -1) {
          this.messages = [
            ...this.messages.slice(0, index),
            ...this.messages.slice(index + 1)
          ];

          this.cd.markForCheck();
        }
      });

    if (this.likesSs) {
      this.likesSs.unsubscribe();
    }
    this.likesSs = this.chatService.likes$
      .pipe(
        filter((like: IChatMessageLike) => boardIds.includes(like.board_id)),
      )
      .subscribe((like: IChatMessageLike) => {
        const message = this.messages.find((m) => m.id === like.comment);
        if (!message) {
          return;
        }

        if (like.user === (account && account.id)) {
          message.current_user_vote = like.vote;
          // Mark comment as like updated
          const i = this.waitLike.indexOf(like.comment);
          this.waitLike.splice(i, 1);
        }

        message.likes = like.likes;
        message.dislikes = like.dislikes;
        this.scrollToBottomIfNeed();
        this.cd.markForCheck();
      });

    this.getHistory(boardIds[0]);
  }

  public getHistory(boardId: number) {
    this.loadingHistory = true;

    if (this.commentsSs) {
      this.commentsSs.unsubscribe();
    }

    // if no boards are there we don't enter this method
    // @TODO in stage 2: getting history for sevaral boards;
    const params: ICommentParams = {limit: `${this.limit}`, offset: `${this.offset}`, board: `${boardId}`};
    this.commentsSs = this.commentService.getAll(params)
      .pipe(
        take(1)
      )
      .subscribe((response) => {
        // needed to return scroll after loading history
        this.fromBottom = this.messagesListComponent.nativeElement.scrollHeight
          - this.messagesListComponent.nativeElement.scrollTop;

        if (response.results.length < 1) {
          this.messagesFinished = true;
        }

        const messages = response.results
        // filter duplicate messages
          .filter((comment: IComment) => !this.messages.find(m => m.id === comment.id))
          .map((comment: IComment, index: number): IChatMessage => ({
            ...comment,
            my: this.account && comment.user && this.account.id === comment.user.id,
          }));

        this.messages = [...messages.reverse(), ...this.messages];
        this.loadingHistory = false;
        this.cd.markForCheck();
        this.returnScroll();
      });
  }

  public onEnterText() {
    let messageText = this.messageText.slice(0, MAX_MESSAGE_LENGTH).trim();
    messageText = this.replaceNameToTags(messageText);
    if (messageText && !this.chatLocked) {
      if (this.account) {
        const requestId = uuidv4();
        this.requests.push(requestId);
        const currentBoardId = this.boards[0]; // if no boards are there we don't enter this method

        this.commentService.send({text: messageText, board: currentBoardId})
          .subscribe(
            () => {
              this.messageText = '';
              this.messageReplies = [];
              this.cd.markForCheck();
            },
            (e) => {
              this.messageText = messageText;
              this.cd.markForCheck();

              if (e.error && e.error.detail) {
                this.store$.dispatch(new GameOpenChatInfoModal({detail: e.error.detail, type: ChatInfoModalTypes.BANNED}));
              } else {
                console.error(e);
              }
            }
          );
      } /* else if (this.profile && !this.profile.premium) {
        this.store$.dispatch(new GameOpenChatInfoModal({
          detail: `We had to restrict access to the chat and permit the access to premium users only because of internet trolls
            (yes, trolls!). Once the trolls move elsewhere, we'll open it up asap. Meanwhile,
            if you have any feedback, suggestions or questions concerning the Championship,
            please contact support@worldchess.com.`,
          type: ChatInfoModalTypes.RESTRICTED
        }));
      } */

      this.scrollToBottom();
    }
  }

  public onScrollTop() {
    // Here we should check only if user scrolled to the top of the messages
    if (this.messagesListComponent.nativeElement.scrollTop === 0 && !this.loadingHistory) {
      // if (this.offset + this.limit < this.total) {
      if (!this.messagesFinished) {
        this.offset = this.offset + this.limit;
        if (this.boards.length > 0) {
          this.getHistory(this.boards[0]);
        }
      }
    }
  }

  public scrollToBottom() {
    if (this.messagesListComponent) {
      this.shouldScrollDown = true;
      this.cd.markForCheck();
    }
  }

  public returnScroll() {
    this.shouldReturnScroll = true;
    this.cd.markForCheck();
  }


  public setPopupAction(fn: any) {
    this.openPopup = fn;
    this.cd.markForCheck();
  }

  public setMessageText($event) {
    this.messageText = $event;
    this.messageReplies = this.messageReplies
      .filter(u => this.messageText.indexOf(u.full_name) !== -1);
    this.cd.markForCheck();
  }

  public onOpenPopup($event) {
    $event.stopPropagation();
    this.openPopup();
  }

  private needToScrollOnNewMessage(): boolean {
    const element = this.messagesListComponent.nativeElement;
    return element.scrollHeight - element.scrollTop === element.clientHeight;
  }

  private getRandomBackgroundColor() {
    const random = Math.random() * 4;
    let color;
    if (random < 1) {
      color = '#935353';
    } else if (random < 2) {
      color = '#a89191';
    } else if (random < 3) {
      color = '#b189d6';
    } else {
      color = '#ff9999';
    }
    return `${color}`;
  }

  public openChatScreen() {
    this.openMobileClass = true;
    if (window.innerWidth <= MAX_WIDTH_SCREEN_LOCK) {
      this.screenService.lock();
    }
  }

  public closeChatScreen() {
    this.openMobileClass = false;
    this.screenService.unlock();
  }

  /**
   * Locked chat after DELAY_LOCK_CHAT of end game
   */
  private subscribeEndGame() {
    if (this.endGameSs) {
      this.endGameSs.unsubscribe();
    }
    this.showFinishMessage = false;
    this.gameOver = false;
    this.updateChatLocked();

    this.endGameSs = this.selectedBoard$
      .pipe(
        filter(board => board && board.status === BoardStatus.COMPLETED),
        take(1),
        switchMap((board) => {
          // Lock chat now if board without end game time
          if (!board.end_time) {
            return of(board);
          }

          // Calc delay ms before lock chat
          const endTime = moment(board.end_time).add(DELAY_LOCK_CHAT);
          const msToBlockChat = endTime.diff(moment(), 'ms');

          // Wait delay before lock chat
          return of(board).pipe(delay(Math.max(0, msToBlockChat)));
        })
      )
      .subscribe(() => {
        this.gameOver = true;
        this.showFinishMessage = true;
        this.updateChatLocked();
        this.cd.markForCheck();
        if (this.messagesSs) {
          this.messagesSs.unsubscribe();
        }
        if (this.likesSs) {
          this.likesSs.unsubscribe();
        }
      });
  }

  public likeMessage(message: IComment) {
    if (this.chatLocked || this.waitLike.includes(message.id)) {
      return;
    }

    // Flag for skip send repeat request
    this.waitLike.push(message.id);

    this.commentService.like(message.id)
      .pipe(take(1))
      .subscribe(() => {/**/});
  }

  public unlikeMessage(message: IComment) {
    if (this.chatLocked || this.waitLike.includes(message.id)) {
      return;
    }

    // Flag for skip send repeat request
    this.waitLike.push(message.id);

    this.commentService.unlike(message.id)
      .pipe(take(1))
      .subscribe(() => {/**/});
  }

  public dislikeMessage(message: IComment) {
    if (this.chatLocked || this.waitLike.includes(message.id)) {
      return;
    }

    // Flag for skip send repeat request
    this.waitLike.push(message.id);

    this.commentService.dislike(message.id)
      .pipe(take(1))
      .subscribe(() => {/**/});
  }

  updateChatLocked() {
    this.chatLocked = !this.account || !this.boards.length || this.gameOver;
  }

  replyMessage(message: IChatMessage) {
    const existUser = this.messageReplies.find(r => r.id === message.user.id);
    if (!!existUser) {
      // Skip add reply if use exist
      this.focusInput.next(true);
      return;
    }

    // Add reply
    this.messageReplies.push(message.user);
    this.messageText = `${message.user.full_name}, ${this.messageText}`.slice(0, MAX_MESSAGE_LENGTH);
    this.focusInput.next(true);
  }

  replaceNameToTags(message: string): string {
    let m = message.trim();

    // Clear user tags
    m = BackLightReplyMessagePipe.clearTags(m);

    let endRepliesLine = false;

    // add tags for every reply
    return m.split(',')
      .map(s => {
        if (endRepliesLine) {
          return s;
        }

        let out = s;

        const player = this.messageReplies.find(p => p.full_name === s.trim());
        if (player) {
          out = BackLightReplyMessagePipe.createTag(player.full_name);
        } else {
          endRepliesLine = true;
        }
        return out;
      }).join(', ');
  }

  get notMoveMessages(): IChatMessage[] {
    return this.messages.filter(m => !m.move);
  }

  get showChatPlaceholder(): boolean {
    return !this.gameOver && !this.showFinishMessage && this.messages.length === 0 && this.boards.length === 0;
  }
}
