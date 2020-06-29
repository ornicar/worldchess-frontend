import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  'name': 'wcFullNameInitials',
})
export class FullNameInitialPipe implements PipeTransform {
  private readonly regexp = /(\b[A-z])+/g;

  transform(text: string) {
    if (!text || !text.length) {
      return text;
    }

    const parts = text.split(' ');
    return parts.length === 1
      ? parts[0]
      : String(`${parts[0]} ${parts.slice(1).map(p => String(p).match(this.regexp)).join('')}`);
  }
}
