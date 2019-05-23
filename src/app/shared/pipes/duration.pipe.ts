import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'wcDuration'
})
export class DurationPipe implements PipeTransform {
  transform(value: number | string, format: string, settings: moment.DurationFormatSettings = null): string {
    if (!value) {
      value = 0;
    }

    return moment.duration(value).format(format, settings);
  }
}
