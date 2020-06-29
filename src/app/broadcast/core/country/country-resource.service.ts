import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ICountry } from './country.model';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable()
export class CountryResourceService {

  private cache$: Observable<ICountry[]>;

  constructor(private http: HttpClient) {}

  get(id: number) {
    return this.getAll().pipe(switchMap(countries => of(countries.find(c => c.id === id))));
  }

  getAll(): Observable<ICountry[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<ICountry[]>(`${environment.endpoint}/countries/`).pipe(
        map((countries: ICountry[]) => countries || []),
        shareReplay(1),
      );
    }

    return this.cache$;
  }

  getCountryName(code: number): Observable<string> {
    return this.get(code).pipe(
      map((country) => (country ? country.name : ''))
    );
  }

  getCountryCode(code: number): Observable<string> {
    return this.get(code).pipe(
      map((country) => (country ? country.code : ''))
    );
  }
}
