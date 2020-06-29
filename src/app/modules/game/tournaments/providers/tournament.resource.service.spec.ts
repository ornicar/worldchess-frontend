import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { TournamentState } from '../states/tournament.state';
import { NgxsModule } from '@ngxs/store';
import { SocketConnectionService } from '../../../../auth/socket-connection.service';
import { OnlineTournamentResourceService } from '@app/modules/game/tournaments/providers/tournament.resource.service';
import { TestBed, inject } from '@angular/core/testing';
import {  HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as fromBoard from '@app/broadcast/core/board/board.reducer';
import * as sourceBoards from '../../../../../../e2e/dataUnitTest/boards/boardSource.json';
import * as resultBoards from '../../../../../../e2e/dataUnitTest/boards/boardResult.json';
import * as resultBoardsWithPagination from '../../../../../../e2e/dataUnitTest/boards/boardResultWithPagination.json';
import * as sourceBoardsPage1 from '../../../../../../e2e/dataUnitTest/boards/boardSource-pagination.json';
import * as sourceBoardsPage2 from '../../../../../../e2e/dataUnitTest/boards/boardSource-pagination-2.json';
import { environment } from '../../../../../environments/environment';

describe('Description OnlineTournamentResourceService', () => {
  let resourService: OnlineTournamentResourceService;
  let backend: HttpTestingController;
  const tournamnetID = 651;
  const boardsURL = `${environment.endpoint}/online/tournament/gaming/?exclude_odd_boards=true&tournament_id=${tournamnetID}`;
  const boardsURLPagination = `${environment.endpoint}/online/tournament/gaming/?exclude_odd_boards=true&limit=20&offset=20&tournament_id=${tournamnetID}`;

  beforeEach(function() {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxsModule.forRoot([TournamentState]),
        StoreModule.forRoot([fromBoard.reducer]),
        RouterTestingModule
      ],
      providers: [
        OnlineTournamentResourceService,
        SocketConnectionService,
      ]
    });

    backend = TestBed.get(HttpTestingController);
    resourService = TestBed.get(OnlineTournamentResourceService);

    jest.spyOn(console, 'error').mockImplementation(() => undefined);

  });

  beforeEach(
    inject([OnlineTournamentResourceService, HttpTestingController], (_service, _httpMock) => {
      resourService = _service;
      backend = _httpMock;
    })
  );

  afterEach(inject([HttpTestingController], (_backend: HttpTestingController) => {
    _backend.verify();
  }));

  describe('OnlineTournamentResourceService', () => {
    test('should create an instance successfully', () => {
      backend.expectNone({});
      expect(resourService).toBeDefined();
    });

    describe('Boards', () => {

      test('getBoards without pagination', () => {
          let actualDataAll = [];
          resourService.getBoards(tournamnetID).subscribe(data => actualDataAll = data);

          backend.expectOne((req: HttpRequest<any>) => {
            return req.urlWithParams === boardsURL && req.method === 'GET';
          }, `GET all data from ${boardsURL}`).flush(sourceBoards);

          expect(actualDataAll).toEqual(resultBoards);
      });

      /*test('getBoards with pagination', () => {
        let actualDataAll = [];
        resourService.getBoards(tournamnetID).subscribe(data => actualDataAll = data);

        backend.expectOne((req: HttpRequest<any>) => {
          return req.urlWithParams === boardsURL && req.method === 'GET';
        }, `GET all data from ${boardsURL}`).flush(sourceBoardsPage1);

        expect(actualDataAll).toEqual(resultBoardsWithPagination);
      });*/
    });
  });
});
