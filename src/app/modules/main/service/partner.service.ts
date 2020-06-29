import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {Partner} from "@app/modules/main/model/partner";
import {environment} from "../../../../environments/environment";
import {catchError, take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PartnerService {

  constructor(private http: HttpClient) { }


  public findPartners():Observable<Partner[]> {
      return this.http.get<Partner[]>(`${environment.endpoint}/partner`).pipe(catchError(val=>of([] as Partner[]))).pipe(take(1));
  }

}
