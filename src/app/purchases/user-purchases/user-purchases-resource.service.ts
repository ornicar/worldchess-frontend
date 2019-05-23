import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUserPurchase } from './user-purchases.model';
import { environment } from '../../../environments/environment';


@Injectable()
export class UserPurchasesResourceService {

  constructor(private http: HttpClient) { }

  get() {
    return this.http.get<IUserPurchase>(`${environment.endpoint}/me/purchases/`);
  }

}
