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
  public backgroundColorPaid: string;
  public colorPaid: string;

  constructor() { }

  ngOnInit() {
    this.color = this.getRandomBackgroundColor();
    this.backgroundColorPaid = this.getRandomBackgroundColorPaid();
    this.colorPaid = this.getRandomColorPaid();
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

  public getRandomBackgroundColorPaid() {
    const random = Math.random() * 2;
    let backgroundColorPaid;
    if(this.message.my && this.message.user.paid) {
      if (random < 1) {
        backgroundColorPaid = '#D4C7FF';
      } else {
        backgroundColorPaid = '#FFC7AE';
      }
      
    } else {
      backgroundColorPaid = '#FFF';
    }
    return `${backgroundColorPaid}`;
  }

  public getRandomColorPaid() {
    const random = Math.random() * 2;
    let colorPaid;
    if(this.message.user.paid && !this.message.my) {
      if (random < 1) {
        colorPaid = '#00C24F';
      } else {
        colorPaid = '#F64747';
      }
    } else {
      colorPaid = '#9d9d9d';
    }
    return `${colorPaid}`;
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
