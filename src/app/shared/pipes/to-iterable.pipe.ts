import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'wcToIterable'
})
export class ToIterablePipe implements PipeTransform {
  transform(dict: Object) {
    return Object.keys(dict || {}).map(key => dict[key]);
  }
}
