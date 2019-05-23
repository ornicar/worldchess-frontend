import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'wcBgUrl',
  pure: true
})
export class WcBgUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url) {
    return this.sanitizer.bypassSecurityTrustStyle(url ? `url(${url})` : '');
  }
}
