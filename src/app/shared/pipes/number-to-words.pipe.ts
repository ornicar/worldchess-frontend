import {Pipe, PipeTransform} from '@angular/core';

const th = ['', ' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion'];
const dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

@Pipe({
  name: 'wcNumberToWorlds'
})
export class NumberToWorlds implements PipeTransform {
  transform(value: number): string {
    let out = value.toString();
    out = out.replace(/[\, ]/g, '');
    if (out !== parseFloat(out).toString()) {
      return 'not a number';
    }
    let x = out.indexOf('.');
    if (x === -1) {
      x = out.length;
    }
    if (x > 15) {
      return 'too big';
    }
    const n = out.split('');
    let str = '';
    let sk = 0;
    for (let i = 0; i < x; i++) {
      if ((x - i) % 3 === 2) {
        if (n[i] === '1') {
          str += tn[Number(n[i + 1])] + ' ';
          i++;
          sk = 1;
        } else if (n[i] !== '0') {
          str += tw[parseInt(n[i], 10) - 2] + ' ';
          sk = 1;
        }
      } else if (n[i] !== '0') {
        str += dg[n[i]] + ' ';
        if ((x - i) % 3 === 0) {
          str += 'hundred ';
        }
        sk = 1;
      }
      if ((x - i) % 3 === 1) {
        if (sk) {
          str += th[(x - i - 1) / 3] + ' ';
        }
        sk = 0;
      }
    }
    if (x !== out.length) {
      const y = out.length;
      str += 'point ';
      for (let i = x + 1; i < y; i++) {
        str += dg[n[i]] + ' ';
      }
    }
    return str.replace(/\s+/g, ' ');
  }
}
