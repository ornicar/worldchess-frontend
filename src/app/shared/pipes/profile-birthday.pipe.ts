import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({
  name: 'wcProfileBirthday'
})
export class ProfileBirthdayPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    return moment(value).format('DD MMM, YYYY');
  }
}
