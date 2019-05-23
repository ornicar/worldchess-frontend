import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ISchedule } from './schedule.model';

@Injectable()
export class ScheduleResourceService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<ISchedule[]>(`${environment.endpoint}/schedules/`);
  }

  get(id: number) {
    return this.http.get<ISchedule>(`${environment.endpoint}/schedules/${id}/`);
  }

  getByTournamentId(tournament_id: number) {
    const params = new HttpParams().set('tournament_id', tournament_id.toString()).set('ordering', 'date');
    return this.http.get<ISchedule[]>(`${environment.endpoint}/schedules/`, { params });
  }
}
