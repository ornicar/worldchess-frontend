import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {ICountry} from './country.model';

@Injectable()
export class CountryResourceService {

  constructor(private http: HttpClient) { }

  get(id: number) {
    return this.http.get<ICountry>(`${environment.endpoint}/countries/${id}/`);
  }

  getAll() {
    return this.http.get<ICountry[]>(`${environment.endpoint}/countries/`);
  }
}
