import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import { IEventPartner, IPartner } from './partners.model';
import { Observable } from 'rxjs';
@Injectable()
export class PartnersService {

  constructor(private httpClient: HttpClient) {
  }

  getAllEventPartners(): Observable<IEventPartner[]> {
    return this.httpClient.get<IEventPartner[]>(`${environment.endpoint}/eventpartner/`);
  }

  getAllParnters(): Observable<IPartner[]> {
    return this.httpClient.get<IPartner[]>(`${environment.endpoint}/partner/`);
  }
}

