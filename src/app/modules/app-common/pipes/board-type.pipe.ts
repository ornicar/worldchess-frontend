import { Pipe, PipeTransform } from '@angular/core';
import {BoardType} from "@app/broadcast/core/tour/tour.model";

@Pipe({
  name: 'boardType'
})
export class BoardTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    switch (value) {
      case BoardType.RAPID:
        return 'Rapid';
      case BoardType.BLITZ:
        return 'Blitz';
      case BoardType.BULLET:
        return 'Bullet';
      case BoardType.ARMAGEDDON:
        return 'Armageddon';
      case BoardType.CLASSIC:
        return 'Bullet';
    }
  }

}
