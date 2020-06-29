import { GameTranslateService } from './../../service/game-translate.service';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import { ChatSocketService } from '@app/broadcast/chess/chat/services/chat-socket.service';
import { CommentsResourceService, IComment } from '@app/broadcast/chess/chat/comments-resource.service';
import { GameState } from '@app/modules/game/state/game.state';
import { defaultIfEmpty, delay, distinctUntilChanged, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { GameService } from '@app/modules/game/state/game.service';
import * as fromAuth from '../../../../auth/auth.reducer';
import { selectToken } from '../../../../auth/auth.reducer';
import { select, Store as NGRXStore } from '@ngrx/store';
import { IChatMessage } from '@app/broadcast/chess/chat/chat-message/chat-message.component';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { ActivatedRoute, Router } from '@angular/router';
import { SetNewMessage } from '@app/modules/game/state/game.actions';
import { INewMessage, TypeChat } from '@app/modules/game/state/game.model';
import { selectMyAccount } from '@app/account/account-store/account.reducer';

@Component({
  selector: 'game-chat',
  templateUrl: './game-chat.component.html',
  styleUrls: ['./game-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameChatComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private destroy$ = new Subject();

  @Input() viewChat: TypeChat = TypeChat.GAME;

  @Output() hideChat = new EventEmitter<void>();

  @Input() chatID = null;
  @OnChangesInputObservable('chatID')
  public chatID$ = new BehaviorSubject<string>(this.chatID);

  @Input() disableMessage: string = null;
  @OnChangesInputObservable('disableMessage')
  public disableMessage$ = new BehaviorSubject<string>(this.disableMessage);

  @Select(GameState.boardId) getBoardId$: Observable<string>;
  @Select(GameState.getLastChatId) getLastChatId$: Observable<string>;
  @Select(GameState.getShowChat) getShowChat$: Observable<boolean>;
  @Select(GameState.getNewMessage) getNewMessage$: Observable<INewMessage>;

  @ViewChild('messagesList', { static: false }) private messagesListComponent: ElementRef;
  @ViewChild('messageInput', { static: false }) private messagesInput: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;

  private limit = 100;
  private offset = 0;
  private resultMessageCount = 0;
  public messagesSubscription: Subscription;
  public commentGroup: Array<IChatMessage> = [];

  token$ = this.authStore.pipe(select(selectToken));

  accountId$: Observable<number> = this.authStore.pipe(
    select(selectMyAccount),
    distinctUntilChanged(),
    // filter(i => !!i),
    switchMap((i) => {
      if (i) {
        return of(i.id);
      } else {
        return of(0);
      }
    })
  );

  youMessage$ = this.gameTranslateService.getTranslate(`CHAT.YOUR_MESSAGE`);

  private _chatID$ = this.chatID$.pipe(filter((i) => !!i));
  private body = document.getElementsByTagName('body')[0];

  isNearBottom = true;
  private subs: Subscription;

  comments$ = this._chatID$.pipe(
    switchMap((chatId) => {
      if (chatId) {
        return this.commentSerivce
          .getAll({
            limit: `${this.limit}`,
            offset: `${this.offset}`,
            chat_id: `${chatId}`,
          })
          .pipe(
            map((res) => res.results),
            filter((res) => res.length > 0),
            defaultIfEmpty([]),
            distinctUntilChanged()
          );
      } else {
        return of(null);
      }
    })
  );

  constructor(
    private chatService: ChatSocketService,
    private commentSerivce: CommentsResourceService,
    private authStore: NGRXStore<fromAuth.State>,
    private cd: ChangeDetectorRef,
    private store: Store,
    public gameTranslateService: GameTranslateService
  ) {}

  ngOnInit() {
    this.subs = combineLatest([this.accountId$, this._chatID$, this.getShowChat$]).subscribe(
      ([accountID, chatID, isShow]) => {
        if (chatID) {
          this.subcribeMessages(chatID, accountID, isShow);
        } else {
          this.unsubscribeChat();
        }
        this.cd.markForCheck();
      }
    );

    combineLatest([this.getNewMessage$, this.getShowChat$])
      .pipe(take(1))
      .subscribe(([message, isShow]) => {
        this.store.dispatch(new SetNewMessage(message.id, message.userId, false, true));
      });
  }

  public subcribeMessages(chatId: string, accountID: number, isShow: boolean) {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    this.messagesSubscription = this.chatService.messages$
      .pipe(
        map(({ comments }) => comments),
        filter((comments) => comments.length > 0),
        distinctUntilChanged(),
        switchMap((comments) => {
          if (comments.length !== 0) {
            return of(
              comments
                .filter((comment) => comment.chat === chatId)
                .map(
                  (comment: IComment, index: number): IChatMessage => ({
                    ...comment,
                    my: comment.user.id === accountID,
                  })
                )
            );
          } else {
            return of([]);
          }
        })
      )
      .subscribe((comments) => {
        if (this.commentGroup.length > 0) {
          this.commentGroup = [...this.commentGroup, ...comments];
          this.store.dispatch(new SetNewMessage(comments[0].id, comments[0].user.id, false, isShow));
        } else {
          this.commentGroup = [...comments];
          this.store.dispatch(new SetNewMessage(comments[0].id, comments[0].user.id, false, isShow));
        }
        this.cd.markForCheck();
      });
  }

  private unsubscribeChat() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeChat();
    this.subs.unsubscribe();
  }

  closeChat() {
    // this.store.dispatch(new SetNewMessage(false));
    this.body.classList.remove('fix-mobile');
    this.unsubscribeChat();
    this.hideChat.emit();
  }

  enterText(event: KeyboardEvent) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      this.sendText();
      this.cd.markForCheck();
    }
  }

  sendText() {
    this._chatID$.subscribe((data) => {});
    this._chatID$.subscribe((chatID) => {
      this.commentSerivce
        .send({
          text: this.messagesInput.nativeElement.value,
          chat: chatID,
        })
        .subscribe(() => {
          this.messagesInput.nativeElement.value = '';
        });
    });
  }

  scrolled(event: any): void {
    this.isNearBottom = this.isUserNearBottom();
  }

  ngAfterViewInit(): void {
    this.itemElements.changes.pipe(delay(100)).subscribe((_) => {
      if (this.resultMessageCount !== this.itemElements.length) {
        this.resultMessageCount = this.itemElements.length;
        this.onItemElementsChanged();
      }
    });

    combineLatest([this.comments$.pipe(filter((i) => !!i)), this.accountId$, this._chatID$])
      .pipe(take(1), distinctUntilChanged())
      .subscribe(([comments, userID, chatID]) => {
        // this.store.dispatch(new SetNewMessage(false));
        if (comments) {
          const _comments = comments
            .filter((comment) => comment.chat === chatID)
            .map(
              (comment: IComment, index: number): IChatMessage => ({
                ...comment,
                my: comment.user.id === userID,
              })
            );
          if (this.commentGroup.length > 0) {
            this.commentGroup = [..._comments.reverse(), ...this.commentGroup];
          } else {
            this.commentGroup = [..._comments.reverse()];
          }
          this.cd.markForCheck();
        }
      });
  }

  @OnChangesObservable()
  public ngOnChanges() {}

  private isUserNearBottom(): boolean {
    const threshold = 120;
    const position =
      this.messagesListComponent.nativeElement.scrollTop + this.messagesListComponent.nativeElement.offsetHeight;
    const height = this.messagesListComponent.nativeElement.scrollHeight;
    return position > height - threshold;
  }

  private onItemElementsChanged(): void {
    this.scrollToBotom();
  }

  scrollToBotom(): void {
    this.messagesListComponent.nativeElement.scroll({
      top: this.messagesListComponent.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  }
}
