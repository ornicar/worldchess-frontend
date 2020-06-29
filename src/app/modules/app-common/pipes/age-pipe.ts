import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {


  transform(value: any, ...args: any[]): any {
    if (!value) {
      return '';
    }
    return moment().diff(moment(value, 'YYYY-MM-DD'), 'years');
  }

}
