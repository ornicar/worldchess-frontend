import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'wcFullNameCutName'
})
export class FullNameCutNamePipe implements PipeTransform {

  /**
   * Examples:
   * LastName FirstName (......)   => LastName F
   * Last-Name, FirstName (......) => Last-Name, F
   * Last'Name, FirstName (......) => Last'Name, F
   * LastName, FirstName           => LastName, F
   */
  private readonly lastNameAndFirstLetterOfFirstName = /^[a-z-']+[,]?\s[a-z]/i;

  transform(fullName: string): string {
    return this.cutName(fullName || '');
  }

  cutName(text: string): string {
    const match = text.match(this.lastNameAndFirstLetterOfFirstName);

    return match ? match[0] : text;
  }
}
