import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wcRemoveFigureNotation'
})
export class RemoveFigureNotationPipe implements PipeTransform {

  static readonly figureKeys = [ 'Q', 'P', 'B', 'R', 'K', 'N' ];

  transform(notation: string, args?: any): any {
    if (!notation) {
      return '';
    }

    return RemoveFigureNotationPipe.figureKeys.includes(notation[0]) ? notation.slice(1) : notation;
  }

}
