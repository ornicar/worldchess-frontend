import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';


export enum PartnerType {
  MAIN = 1,
  ADDITIONAL = 2,
  MASS_MEDIA = 3,
}

export interface ITournamentPartner {
  id: number;
  partner: number;
  partner_cat: PartnerType;
  partner_seq: number;
}

@Injectable()
export class TournamentPartnersService {

  constructor(private http: HttpClient) {
  }

  getForTournament(tournamentId: number) {
    return this.http.get<ITournamentPartner[]>(`${environment.endpoint}/founder/tournaments/${tournamentId}/partners/`);
  }

  addForTournament(tournamentId: number, partner: ITournamentPartner) {
    const { id, ...rest } = partner;
    return this.http.post<ITournamentPartner>(`${environment.endpoint}/founder/tournaments/${tournamentId}/partners/`, rest);
  }

  updateForTournament(tournamentId: number, partner: ITournamentPartner) {
    return this.http.patch<ITournamentPartner>(
      `${environment.endpoint}/founder/tournaments/${tournamentId}/partners/${partner.id}/`,
      partner
    );
  }

  deleteFromTournament(tournamentId: number, partnerId: number) {
    return this.http.delete(`${environment.endpoint}/founder/tournaments/${tournamentId}/partners/${partnerId}/`);
  }
}
