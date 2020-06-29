import { AccountService } from './../../../../account/account-store/account.service';
import { IOnlineTournamentStandings, IOnlineTournament } from './../models/tournament.model';
import { TranslateService } from '@ngx-translate/core';
import { SetStandings, UpdateStandings, UpdateTournamentState, UpdateUserSigned } from './../states/tournament.actions';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { IOnlineTournamentTeamPlayer } from '@app/broadcast/core/tournament/tournament.model';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { Injectable } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';
import {
  SetBoardsTournament,
  SetToursTournament,
  UpdateBoardsTournament,
  UpdateToursTournament,
} from '@app/modules/game/tournaments/states/tournament.actions';
import { Observable } from 'rxjs';
import { take, filter, first } from 'rxjs/operators';
import { IOnlineTournamentBoard } from '@app/modules/game/tournaments/models/tournament.model';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';

@Injectable()
export class OnlineTournamentService {
  /**
   * Get board ID by tour
   * @type {Observable<string>}
   * @memberof OnlineTournamentService
   */
  @Select(TournamentGameState.tourBoardId) tourBoard$: Observable<string>;

  /**
   * Get players by tournament
   * @type {Observable<IOnlineTournamentTeamPlayer[]>}
   * @memberof OnlineTournamentService
   */
  @Select(TournamentState.getTournamentPlayers) getTournamentPlayers$: Observable<IOnlineTournamentTeamPlayer[]>;

  /**
   *Creates an instance of OnlineTournamentService.
   * @param {Store} store
   * @param {OnlineTournamentResourceService} onlineTournamentResourceSerivce
   * @param {TourResourceService} tourResourceService
   * @param {GameResourceService} gameResource
   * @memberof OnlineTournamentService
   */
  constructor(
    private store: Store,
    private onlineTournamentResourceSerivce: OnlineTournamentResourceService,
    private tourResourceService: TourResourceService,
    private gameResource: GameResourceService,
    private accountService: AccountService,
    private translateService: TranslateService
  ) {}

  private processStates: Set<number> = new Set();
  private processTours: Set<number> = new Set();
  private processBoards: Set<number> = new Set();
  private processStandings: Set<number> = new Set();

  private getBoards(tournamentID: number): Observable<IOnlineTournamentBoard[]> {
    return this.onlineTournamentResourceSerivce.getBoards(tournamentID);
  }

  private createLink(nBlob, nameLink) {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(nBlob);
      return;
    }
    const data = window.URL.createObjectURL(nBlob);
    const link = document.createElement('a');
    link.href = data;
    link.download = `${nameLink}`;
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    setTimeout(function () {
      window.URL.revokeObjectURL(data);
      link.remove();
    }, 100);
  }

  subscribeViewerByBoardID(boadrID: string): void {
    this.onlineTournamentResourceSerivce.subscribeViewerBoardID(boadrID);
  }

  unsubscribeViewerByBoardID(boardID: string): void {
    this.onlineTournamentResourceSerivce.unsubscribeViewBoardID(boardID);
  }

  setOnlineBoards(tournamentID: number): void {
    if (tournamentID) {
      this.getBoards(tournamentID).subscribe((data) => {
        this.store.dispatch(new SetBoardsTournament(data));
      });
    }
  }

  getStandings(tournamentID: number): Observable<IOnlineTournamentStandings[]> {
    return this.onlineTournamentResourceSerivce
      .getOnlineTournamentStandings(tournamentID)
      .pipe(filter((standings) => !!standings));
  }

  setStandings(tournamentID: number): void {
    this.getStandings(tournamentID).subscribe((data) => {
      this.store.dispatch(new SetStandings(data));
    });
  }

  updateStandings(tournamentID: number): void {
    if (!this.processStandings.has(tournamentID)) {
      this.processStandings.add(tournamentID);
      this.getStandings(tournamentID).subscribe(
        (data) => {
          this.processStandings.delete(tournamentID);
          this.store.dispatch(new UpdateStandings(data));
        },
        () => this.processStandings.delete(tournamentID)
      );
    }
  }

  updateState(tournamentID: number): void {
    if (!this.processStates.has(tournamentID)) {
      this.processStates.add(tournamentID);
      this.onlineTournamentResourceSerivce.getOnlineTournamentState(tournamentID).subscribe(
        (data) => {
          this.processStates.delete(tournamentID);
          this.store.dispatch(new UpdateTournamentState(data));
        },
        () => this.processStates.delete(tournamentID)
      );
    }
  }

  updateOnlineBoards(tournamentID: number): void {
    if (!this.processBoards.has(tournamentID)) {
      this.processBoards.add(tournamentID);
      this.getBoards(tournamentID)
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.processBoards.delete(tournamentID);
            this.store.dispatch(new UpdateBoardsTournament(data));
          },
          () => this.processBoards.delete(tournamentID)
        );
    }
  }

  updateTours(tournamentID: number): void {
    if (!this.processTours.has(tournamentID)) {
      this.processTours.add(tournamentID);
      this.tourResourceService.getByTournament(tournamentID).subscribe(
        (data) => {
          this.processTours.delete(tournamentID);
          this.store.dispatch(new UpdateToursTournament(data));
        },
        () => this.processTours.delete(tournamentID)
      );
    }
  }

  signout(id: number): Observable<IOnlineTournament> {
    return this.onlineTournamentResourceSerivce.signoutInTournament(id);
  }

  downloadPGN(boadID: string) {
    this.onlineTournamentResourceSerivce.getPGN(boadID).subscribe((blob) => {
      const nBlob = new Blob([blob], { type: 'application/text' });
      this.createLink(nBlob, `PGN-${boadID}.pgn`);
    });
  }

  downloadPDF(tournamentID: number, playerID: number) {
    this.accountService
      .getLanguage()
      .pipe(take(1))
      .subscribe((lang) => {
        this.onlineTournamentResourceSerivce.getPDF(tournamentID, playerID, lang).subscribe((blob) => {
          const nBlob = new Blob([blob], { type: 'application/pdf' });
          this.createLink(nBlob, `${tournamentID}-${playerID}.pdf`);
        });
      });
  }

  setTours(tournamentID: number): void {
    this.tourResourceService.getByTournament(tournamentID).subscribe((data) => {
      this.store.dispatch(new SetToursTournament(data));
    });
  }

  signupTournament(id: number): void {
    this.onlineTournamentResourceSerivce.signupToTournament(id).subscribe((data) => {
      this.store.dispatch(new UpdateUserSigned(true));
    });
  }
  getFullValue(point: number) {
    return Math.trunc(point) > 0 ? Math.trunc(point) : point - Math.trunc(point) > 0 ? '' : 0;
  }

  /**
   * Subscribe to board of tour.
   * @param {string} [jwt=''] jwt token by authorizated user
   * @memberof OnlineTournamentService
   */
  subscribeToTourBoard(jwt: string = '') {
    this.tourBoard$.pipe(first()).subscribe((tourBoardID) => {
      this.gameResource.subscribeToBoard(tourBoardID, jwt);
    });
  }

  haveHalfValue(point: number) {
    return point - Math.trunc(point) > 0;
  }

  rankOrderText(rank: number): Observable<string> {
    let rankLang = 'TH';
    switch (rank) {
      case 1:
        {
          rankLang = 'ST';
        }
        break;
      case 2:
        {
          rankLang = 'ND';
        }
        break;
      case 3:
        {
          rankLang = 'RD';
        }
        break;
      default:
        {
          rankLang = 'TH';
        }
        break;
    }
    return this.translateService.get(`PLACE_GAME.${rankLang}`);
  }
}
