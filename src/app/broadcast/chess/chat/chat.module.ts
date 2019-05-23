import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BoardModule } from '../../../board/board.module';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ChatComponent } from './chat.component';
import { CommentsResourceService } from './comments-resource.service';
import { EmojiService } from './emoji-input/emoji.service';
import { EmojiInputComponent } from './emoji-input/emoji-input.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ChatSocketService } from './services/chat-socket.service';
import { FormHelperModule } from '../../../form-helper/form-helper.module';
import { ChatMoveComponent } from './chat-move/chat-move.component';
import { BackLightReplyMessagePipe } from './backLightReplyMessage.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    FormHelperModule,
    BoardModule,
  ],
  providers: [
    ChatSocketService,
    CommentsResourceService,
    EmojiService
  ],
  declarations: [
    BackLightReplyMessagePipe,
    ChatComponent,
    ChatMessageComponent,
    ChatMoveComponent,
    EmojiInputComponent,
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule {
}
