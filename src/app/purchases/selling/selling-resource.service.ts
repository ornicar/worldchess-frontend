import {HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import { ISelling } from './selling.model';

@Injectable()
export class SellingResourceService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<ISelling[]>(`${environment.endpoint}/selling/`);
  }
}
