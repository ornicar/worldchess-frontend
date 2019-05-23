import {Component, OnInit, Input, EventEmitter, Output, AfterContentInit} from '@angular/core';
import {IComment} from '../comments-resource.service';

@Component({
  selector: 'wc-chat-move',
  templateUrl: './chat-move.component.html',
  styleUrls: ['./chat-move.component.scss']
})
export class ChatMoveComponent implements OnInit {
  @Input() public message: IComment;
  @Input() public showLikes: boolean;
  @Output() public onLikeMessage = new EventEmitter<IComment>();
  @Output() public onUnlikeMessage = new EventEmitter<IComment>();
  @Output() public onDislikeMessage = new EventEmitter<IComment>();

  constructor() { }

  ngOnInit() {
  }

  public toggleLikeMessage() {
    if (!this.showLikes) return;

    if (this.message.current_user_vote !== 1) {
      this.onLikeMessage.next(this.message);
    } else if (this.message.current_user_vote === 1) {
      this.onUnlikeMessage.next(this.message);
    }
  }

  public toggleDislikeMessage() {
    if (!this.showLikes) return;

    if (this.message.current_user_vote !== -1) {
      this.onDislikeMessage.next(this.message);
    } else if (this.message.current_user_vote === -1) {
      this.onUnlikeMessage.next(this.message);
    }
  }
}
