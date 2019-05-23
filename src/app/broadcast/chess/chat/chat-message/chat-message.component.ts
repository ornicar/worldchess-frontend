import {Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import {IComment} from '../comments-resource.service';

export interface IChatMessage extends IComment {
  my: boolean;
}

@Component({
  selector: 'wc-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatMessageComponent implements OnInit {
  @Input() public message: IChatMessage;
  @Input() public showLikes: boolean;

  @Output() public like = new EventEmitter<IChatMessage>();
  @Output() public unlike = new EventEmitter<IChatMessage>();
  @Output() public reply = new EventEmitter<IChatMessage>();

  public color: string;

  constructor() { }

  ngOnInit() {
    this.color = this.getRandomBackgroundColor();
  }

  public getRandomBackgroundColor() {
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

  public toggleLikeMessage() {
    if (this.message.current_user_vote !== 1) {
      this.like.next(this.message);
    } else if (this.message.current_user_vote > -1) {
      this.unlike.next(this.message);
    }
  }

  get userPrefix(): string {
    return this.message.user ? this.message.user.full_name.slice(0, 2) : '';
  }
}
