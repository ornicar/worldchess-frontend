import {HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import { IPlan } from './plan.model';

@Injectable()
export class PlanResourceService {

  constructor(private http: HttpClient) { }

  get(id: number) {
    return this.http.get<IPlan>(`${environment.endpoint}/plans/${id}/`);
  }

  getAll() {
    return this.http.get<IPlan[]>(`${environment.endpoint}/plans/`);
  }

}
