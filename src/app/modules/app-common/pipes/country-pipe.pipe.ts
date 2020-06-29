import { Pipe, PipeTransform } from '@angular/core';
import { CountryResourceService } from '@app/broadcast/core/country/country-resource.service';

@Pipe({
  name: 'country_code'
})
export class CountryPipePipe implements PipeTransform {

  constructor(private countryService: CountryResourceService) {
  }

  transform(value: any, ...args: any[]): any {
    if (!value) {
      return '';
    }
    return this.countryService.getCountryCode(value);
  }

}
