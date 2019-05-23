import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';

export interface ITournamentWidget {
  id: string; // uuid
  tour: number;
  match: number;
  board: number;
  is_active: boolean;
}

@Injectable()
export class TournamentWidgetsService {

  constructor(private http: HttpClient) {
  }

  getForTournament(tournamentId: number) {
    return this.http.get<ITournamentWidget[]>(`${environment.endpoint}/founder/tournaments/${tournamentId}/widgets/`);
  }

  addForTournament(tournamentId: number, widget: Partial<ITournamentWidget>) {
    return this.http.post<ITournamentWidget>(`${environment.endpoint}/founder/tournaments/${tournamentId}/widgets/`, widget);
  }

  updateForTournament(tournamentId: number, widgetId: string, widget: Partial<ITournamentWidget>) {
    return this.http.patch<ITournamentWidget>(
      `${environment.endpoint}/founder/tournaments/${tournamentId}/widgets/${widgetId}/`,
      widget
    );
  }

  deleteFromTournament(tournamentId: number, widgetId: string) {
    return this.http.delete(`${environment.endpoint}/founder/tournaments/${tournamentId}/widgets/${widgetId}/`);
  }
}
