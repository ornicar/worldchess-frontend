import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'wcReplace'
})
export class ReplacePipe implements PipeTransform {
  transform(text: string, searchValue: string, newValue): string {
    return String(text).replace(searchValue, newValue);
  }
}
