import { Tournament } from '@app/broadcast/core/tournament/tournament.model';
import { IOnlineTournament, IOnlineTournamentStandings } from '../models/tournament.model';
import { TournamentState } from '@app/modules/game/tournaments/states/tournament.state';
import { IOnlineTournamentBoard } from '@app/modules/game/tournaments/models/tournament.model';
import { SetBoardsTournament, UpdateBoardsTournament, SetStandings, UpdateStandings, SetOnlineTournament, UpdateOnlineTournament } from './tournament.actions';
import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';
import { Store } from '@ngxs/store';
import * as originalBoard from '../../../../../../e2e/dataUnitTest/boards/board.json';

import * as expectedDataStandingPlayers from '../../../../../../e2e/dataUnitTest/standing/standingsWithPlayer.json';
import * as expectedDataChangeStandigsPlayers from '../../../../../../e2e/dataUnitTest/standing/standingChanges.json';

import * as tournamentData from '../../../../../../e2e/dataUnitTest/tournament/tournament.json';
import * as emptyTournamentData from '../../../../../../e2e/dataUnitTest/tournament/emptyTournament.json';
import * as onePlayerData from '../../../../../../e2e/dataUnitTest/tournament/onePlayer.json';
import * as twoPlayerData from '../../../../../../e2e/dataUnitTest/tournament/twoPlayer.json';


describe('TournamentState', () => {
  let store: Store;


  beforeEach(function () {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TournamentState])],
    });

    store = TestBed.get(Store);
  });

  test('should create an state successfully', () => {
    expect(store).toBeDefined();
  });


  describe('Boards', () => {
    let stateBoards: IOnlineTournamentBoard[];
    test('add one boards in empty boards', () => {
      const boards = [];
      store.dispatch(new SetBoardsTournament(boards));
      stateBoards = store.selectSnapshot((state) => state.TournamentState.boards);
      expect(stateBoards).toBeTruthy();
      expect(stateBoards).toEqual([]);

    });

    test('add one element to boards', () => {
      const boards = [];
      store.dispatch(new SetBoardsTournament([]));
      stateBoards = store.selectSnapshot((state) => state.TournamentState.boards);

      boards.push(originalBoard);
      store.dispatch(new UpdateBoardsTournament(boards));
      stateBoards = store.selectSnapshot((state) => state.TournamentState.boards);
      expect(stateBoards).not.toEqual([]);
      expect(stateBoards).toBeTruthy();
      expect(stateBoards.length).toBe(1);
    });

    test('add elements when board has elements', () => {
      const boardA = [];
      const boardB = [];

      boardA.push(originalBoard);
      store.dispatch(new SetBoardsTournament(boardA));

      boardB.push(originalBoard);
      let boardIDs = [
        '4b0d3ba3-b6cf-49ad-8b2e-61053c243e50',
        '80b9c6be-a24d-4955-bf23-5df026c232d7',
        '6387318e-4cb5-4828-93be-5b86747a25ac',
      ];

      boardIDs.forEach( uid => {
        boardB.push({
          ...originalBoard,
          board_id: uid,
        });
      });
      store.dispatch(new UpdateBoardsTournament(boardB));
      stateBoards = store.selectSnapshot((state) => state.TournamentState.boards);
      expect(stateBoards).not.toEqual([]);
      expect(stateBoards).toBeTruthy();
      expect(stateBoards.length).toBe(4);
      boardIDs.forEach(boardID => {
          expect(stateBoards.find(board => board.board_id === boardID)).toBeTruthy();
          expect(stateBoards.find(board => board.board_id === boardID)).not.toBeNull();
          expect(stateBoards.find(board => board.board_id === boardID)).not.toBeUndefined();
      });
    });

    test('changes to an item in the board', () => {
      const boardA = [];
      const boardB = [];
      const copyBoard = Object.assign({}, originalBoard);

      boardA.push(originalBoard);
      store.dispatch(new SetBoardsTournament(boardA));

      copyBoard.result = 3;
      copyBoard.status = 3;
      copyBoard.finished_at = "2020-04-20T12:03:15.944539Z";

      boardB.push(copyBoard);
      store.dispatch(new UpdateBoardsTournament(boardB));
      stateBoards = store.selectSnapshot((state) => state.TournamentState.boards);
      expect(stateBoards).not.toEqual([]);
      expect(stateBoards).toBeTruthy();
      expect(stateBoards.length).toBe(1);

      const firstBoard = stateBoards[0];
      expect(firstBoard).toHaveProperty('result', 3);
      expect(firstBoard).toHaveProperty('status', 3);
    });

    test('combined test for updating boards', () => {
      const boardA = [];
      const boardB = [];
      const boardIDs = [
        '4b0d3ba3-b6cf-49ad-8b2e-61053c243e50',
        '80b9c6be-a24d-4955-bf23-5df026c232d7',
        '80b9c6be-a24d-4955-bf23-5df026c232d8',
        '80b9c6be-a24d-4955-bf23-5df026c232d9',
        '6387318e-4cb5-4828-93be-5b86747a25ac',
      ];
      let changesIDs = [
        '80b9c6be-a24d-4955-bf23-5df026c232d7',
        '6387318e-4cb5-4828-93be-5b86747a25ac',
        '80b9c6be-a24d-4955-bf23-5df026c232d9'
      ];
      let copyBoard = Object.assign({}, originalBoard);

      boardA.push(originalBoard);
      boardIDs.forEach(boardID => {
        boardA.push({
          ...originalBoard,
          board_id: boardID
        });
      });
      store.dispatch(new SetBoardsTournament(boardA));

      boardB.push(copyBoard);
      boardIDs.forEach(boardID => {
        if (changesIDs.includes(boardID)) {
          boardB.push({
            ...copyBoard,
            board_id: boardID,
            moves: [
              {
                fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1',
                san: 'c4',
                cheat: false,
                created: '2020-04-20T12:06:12.658573Z',
                time_left: '00:00:58',
                time_spent: '00:00:02',
                move_number: 1,
                seconds_left: 58,
                is_white_move: true,
                seconds_spent: 2
              },
              {
                fen: 'rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2',
                san: 'e5',
                cheat: false,
                created: '2020-04-20T12:06:13.779525Z',
                time_left: '00:00:59',
                time_spent: '00:00:01',
                move_number: 1,
                seconds_left: 59,
                is_white_move: false,
                seconds_spent: 1
              },
              {
                fen: 'rnbqkbnr/pppp1ppp/8/4p3/2PP4/8/PP2PPPP/RNBQKBNR b KQkq d3 0 2',
                san: 'd4',
                cheat: false,
                created: '2020-04-20T12:06:15.008833Z',
                time_left: '00:00:57',
                time_spent: '00:00:01',
                move_number: 2,
                seconds_left: 57,
                is_white_move: true,
                seconds_spent: 1
              },
              {
                fen: 'rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq d6 0 3',
                san: 'd5',
                cheat: false,
                created: '2020-04-20T12:06:16.357177Z',
                time_left: '00:00:58',
                time_spent: '00:00:01',
                move_number: 2,
                seconds_left: 58,
                is_white_move: false,
                seconds_spent: 1
              },
              {
                fen: 'rnbqkbnr/ppp2ppp/8/3pp3/2PP4/3Q4/PP2PPPP/RNB1KBNR b KQkq - 1 3',
                san: 'Qd3',
                cheat: false,
                created: '2020-04-20T12:06:18.575722Z',
                time_left: '00:00:55',
                time_spent: '00:00:02',
                move_number: 3,
                seconds_left: 55,
                is_white_move: true,
                seconds_spent: 2
              }
            ],
            result: 3,
            status: 3
          });
        } else {
          boardB.push({
            ...copyBoard,
            board_id: boardID
          });
        }
      });
      store.dispatch(new UpdateBoardsTournament(boardB));

      stateBoards = store.selectSnapshot((state) => state.TournamentState.boards);
      expect(stateBoards).toHaveLength(6);
      stateBoards.forEach(board => {
        if (changesIDs.includes(board.board_id)) {
          expect(board).toHaveProperty('moves');
          expect(board).toMatchObject({result: 3});
          expect(board).toMatchObject({status: 3});
        } else {
          expect(board).toMatchObject({result: null});
          expect(board).toMatchObject({status: 1});
        }
      });
    });
  });

  describe('Standings', () => {
    let stateStandings: IOnlineTournamentStandings[];
    const emptyStandings = <IOnlineTournamentStandings[]>[];
    const updateStandings =  <IOnlineTournamentStandings[]>expectedDataStandingPlayers;
    const changeStandings = <IOnlineTournamentStandings[]>expectedDataChangeStandigsPlayers;

    test('add standings', () => {
      store.dispatch(new SetStandings(emptyStandings));
      stateStandings = store.selectSnapshot((state) => state.TournamentState.standings);
      expect(stateStandings).toEqual(emptyStandings);
    });


    test('update standings empty standings', () => {
      store.dispatch(new SetStandings(emptyStandings));
      store.dispatch(new UpdateStandings(emptyStandings));
      stateStandings = store.selectSnapshot((state) => state.TournamentState.standings);
      expect(stateStandings).toEqual(emptyStandings);
    });

    test('change standings one item', () => {
      store.dispatch(new SetStandings(emptyStandings));
      store.dispatch(new UpdateStandings(changeStandings));
      stateStandings = store.selectSnapshot((state) => state.TournamentState.standings);
      expect(stateStandings).toEqual(changeStandings);
    });

    test('update standings', () => {
      store.dispatch(new SetStandings(emptyStandings));
      store.dispatch(new UpdateStandings(updateStandings));
      stateStandings = store.selectSnapshot((state) => state.TournamentState.standings);
      expect(stateStandings).toEqual(updateStandings);
    });
  });
  describe('Tournament', () => {

      let stateTournament: IOnlineTournament = null;
      const emptySourceData = <IOnlineTournament>emptyTournamentData;
      const sourceData = <IOnlineTournament>tournamentData;
      const tournamentOnePlayerData = <IOnlineTournament>onePlayerData;
      const tournamentTwoPlayerData = <IOnlineTournament>twoPlayerData;

      test('added tournament', () => {
        store.dispatch(new SetOnlineTournament(emptySourceData));
        stateTournament = store.selectSnapshot((state) => state.TournamentState.tournament);
        expect(stateTournament).toEqual(emptySourceData);
      });

      test('changed tournament', () => {
        store.dispatch(new SetOnlineTournament(emptySourceData));
        store.dispatch(new UpdateOnlineTournament(tournamentOnePlayerData));
        stateTournament = store.selectSnapshot((state) => state.TournamentState.tournament);
        expect(stateTournament).toEqual(tournamentOnePlayerData);
      });

      test('changed tournament but state by tournament not changed', () => {
        store.dispatch(new SetOnlineTournament(emptySourceData));
        store.dispatch(new UpdateOnlineTournament(tournamentOnePlayerData));
        stateTournament = store.selectSnapshot((state) => state.TournamentState.tournament);
        expect(stateTournament).toEqual(tournamentOnePlayerData);

        store.dispatch(new UpdateOnlineTournament(tournamentOnePlayerData));
        stateTournament = store.selectSnapshot((state) => state.TournamentState.tournament);
        expect(stateTournament).toEqual(tournamentOnePlayerData);
      });

      test('changed people tournament', () => {
        store.dispatch(new SetOnlineTournament(emptySourceData));
        store.dispatch(new UpdateOnlineTournament(tournamentOnePlayerData));
        stateTournament = store.selectSnapshot((state) => state.TournamentState.tournament);
        expect(stateTournament).toEqual(tournamentOnePlayerData);

        store.dispatch(new UpdateOnlineTournament(tournamentTwoPlayerData));
        stateTournament = store.selectSnapshot((state) => state.TournamentState.tournament);
        expect(stateTournament).toEqual(tournamentTwoPlayerData);
      });
  });

  describe('Tours', () => {
    test ('added tours', () => {

    });
  });
});

