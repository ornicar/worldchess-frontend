import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ISubscription } from './subscriptions.model';
import { IPaginationResponse, IPaginationParams } from '../../broadcast/chess-footer/team-players/team-players-resource.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class SubscriptionsResourceService {

  constructor(private http: HttpClient) { }

  getAll(pagParams: IPaginationParams): Observable<{ subscriptions: ISubscription[], count: number}> {
    let params = new HttpParams();

    if (pagParams.limit) {
      params = params.set('limit', pagParams.limit);
    }

    if (pagParams.offset) {
      params = params.set('offset', pagParams.offset);
    }

    return this.http.get<IPaginationResponse<ISubscription>>(`${environment.endpoint}/subscriptions/`, { params }).pipe(
      map((response: IPaginationResponse<ISubscription>) => ({ subscriptions: response.results, count: response.count }))
    );
  }

  get(stripe_id: string) {
    return this.http.get<ISubscription>(`${environment.endpoint}/subscriptions/${stripe_id}/`);
  }

  cancelRenewSubscription(stripe_id: string, notify: boolean = true) {
    return this.http.post<{}>(`${environment.endpoint}/subscriptions/${stripe_id}/cancel/`, { notify });
  }

  resubscribe(stripe_id: string, notify: boolean = true): Observable<any> {
    return this.http.post(`${environment.endpoint}/subscriptions/${stripe_id}/reactivate/`, { notify });
  }
}
