import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'wcGroupBy'
})
export class GroupByPipe implements PipeTransform {
  transform(arr: any[], propName: string): object {
    return this.groupBy(arr, propName);
  }

  // todo: move to common place/service/library (?)
  private groupBy (xs, key) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
}
