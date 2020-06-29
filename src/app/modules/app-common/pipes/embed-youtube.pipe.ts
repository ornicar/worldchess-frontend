import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'embedYoutube'
})
export class EmbedYoutubePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return (value || '').replace('://www.youtube.com/watch?v=','://www.youtube.com/embed/');
  }

}
