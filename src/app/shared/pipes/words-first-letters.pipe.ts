import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'wcWordsFirstLetters'
})
export class WordsFirstLettersPipe implements PipeTransform {
  private readonly regexp = /(\b[A-z])+/g;

  transform(text: string): string {
    return String(text).match(this.regexp).join('');
  }
}
