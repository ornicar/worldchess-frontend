import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { IOnlineTournament, IOnlineTournamentStandings } from '../models/tournament.model';
import { GameRatingMode } from '../../../../broadcast/core/tour/tour.model';
import { SetOnlineTournament } from '../states/tournament.actions';
import { HttpRequest } from '@angular/common/http';
import { GameResourceService } from '@app/modules/game/state/game.resouce.service';
import { TourResourceService } from '@app/broadcast/core/tour/tour-resource.service';
import { OnlineTournamentService } from './tournament.service';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { TournamentState } from '../states/tournament.state';
import { actionMatcher, NgxsModule, Store } from '@ngxs/store';
import { SocketConnectionService } from '../../../../auth/socket-connection.service';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';
import { inject, TestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as fromBoard from '@app/broadcast/core/board/board.reducer';
import { environment } from '../../../../../environments/environment';
import * as expectedDataStandings from '../../../../../../e2e/dataUnitTest/standing/standings.json';
import * as expectedTournament from '../../../../../../e2e/dataUnitTest/tournament/tournament.json';
import * as emptyDataTournament from '../../../../../../e2e/dataUnitTest/tournament/emptyTournament.json';
import * as expectedDataStandingPlayers from '../../../../../../e2e/dataUnitTest/standing/standingsWithPlayer.json';


describe('Description OnlineTournamentResourceService', () => {
  let service: OnlineTournamentService;
  let backend: HttpTestingController;
  const tournamentID = 2811;
  const standingsURL = `${environment.endpoint}/online/tournaments/${tournamentID}/results/`;
  let store: Store;
  const tournament = <IOnlineTournament>Object.assign({}, expectedTournament);
  const emptyTournament = <IOnlineTournament>Object.assign({}, emptyDataTournament);


  beforeEach(function() {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxsModule.forRoot([TournamentState]),
        StoreModule.forRoot([fromBoard.reducer]),
        RouterTestingModule,
        MatDialogModule,
      ],
      providers: [
        OnlineTournamentResourceService,
        SocketConnectionService,
        OnlineTournamentService,
        TourResourceService,
        GameResourceService,
        ModalWindowsService,
      ]
    });
    backend = TestBed.get(HttpTestingController);
    service = TestBed.get(OnlineTournamentService);
    store = TestBed.get(Store);

    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  beforeEach(
    inject([OnlineTournamentService, HttpTestingController], (_service, _httpMock) => {
      service = _service;
      backend = _httpMock;
    })
  );

  afterEach(inject([HttpTestingController], (_backend: HttpTestingController) => {
    _backend.verify();
  }));

  describe('OnlineTournamentService', () => {
    test('should create an instance successfully', () => {
      backend.expectNone({});
      expect(service).toBeDefined();
    });

    describe('Standings', () => {

      let stateStandings: IOnlineTournamentStandings[];

      test('should call the GET standgins api when tournament is status begin', () => {
        let actualDataAll = [];
        service.getStandings(tournamentID).subscribe(data =>   actualDataAll = data);
        store.dispatch(new SetOnlineTournament(emptyTournament));

        backend.expectOne((req: HttpRequest<any>) => {
          return req.url === standingsURL && req.method === 'GET';
        }, `GET all data from ${standingsURL}`).flush([]);

        expect(actualDataAll).toEqual([]);

      });

      test('should call the GET standings api and return all results', () => {
        let actualDataAll = [];

        service.getStandings(tournamentID).subscribe(data =>   actualDataAll = data);

        store.dispatch(new SetOnlineTournament(tournament));

        backend.expectOne((req: HttpRequest<any>) => {
          return req.url === standingsURL && req.method === 'GET';
        }, `GET all data from ${standingsURL}`).flush(expectedDataStandings);

        expect(actualDataAll).toEqual(expectedDataStandings);
      });

      test('should call the GET standings api and return all results through state', () => {

        store.dispatch(new SetOnlineTournament(tournament));

        service.setStandings(tournamentID);
        backend.expectOne((req: HttpRequest<any>) => {
          return req.url === standingsURL && req.method === 'GET';
        }, `GET all data from ${standingsURL}`).flush([]);

        service.updateStandings(tournamentID);
        backend.expectOne((req: HttpRequest<any>) => {
          return req.url === standingsURL && req.method === 'GET';
        }, `GET all data from ${standingsURL}`).flush(expectedDataStandingPlayers);

        stateStandings = store.selectSnapshot((state) => state.TournamentState.standings);

        expect(stateStandings).toEqual(expectedDataStandingPlayers);
      });
    });
  });
});
