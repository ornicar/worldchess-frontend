import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'wcBackLightReplyMessage'
})
export class BackLightReplyMessagePipe implements PipeTransform {
  static getChatReplyMask() {
    return /\[name:([^\]]*)\]/ig;
  }

  static clearTags(message: string) {
    return message.replace(BackLightReplyMessagePipe.getChatReplyMask(), (match) => {
      const regExecResult = BackLightReplyMessagePipe.getChatReplyMask().exec(match);
      if (regExecResult) {
        return regExecResult[1];
      }
      return match;
    });
  }

  static createTag(name: string) {
    return `[name:${name}]`;
  }

  transform(message: string): string {
    return message.replace(BackLightReplyMessagePipe.getChatReplyMask(), (match) => {
      const matchName = BackLightReplyMessagePipe.getChatReplyMask().exec(match);
      if (matchName) {
        return `<span class="text-reply">${matchName[1]}</span>`;
      }
      return match;
    });
  }
}
