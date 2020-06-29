import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'game-chat-message',
  templateUrl: './game-chat-message.component.html',
  styleUrls: ['./game-chat-message.component.scss']
})
export class GameChatMessageComponent implements OnInit {

  @Input() textMsg: string;
  @Input() answer: string;
  @Input() abbv: string;
  @Input() link: string;

  constructor() { }
  ngOnInit() {
  }

}
