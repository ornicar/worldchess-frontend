import { ITournamentState } from './../models/ITournamentState';
import { IOnlineTournamentStandings } from './../models/tournament.model';
import { SetStandings, UpdateStandings, UpdateTournamentState, UpdateUserSigned } from './tournament.actions';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import {
  SetBoardsTournament,
  SetCurrentTourID,
  SetOnlineTournament,
  SetToursTournament,
  SubscribeToBoardsByBoardID,
  SubscribeViewerByBoardID,
  UnsubscribeToBoardsByBoardID,
  UpdateBoardsTournament,
  UpdateOnlineTournament,
  UpdateToursTournament,
} from '@app/modules/game/tournaments/states/tournament.actions';
import { IOnlineTournamentBoard } from '@app/modules/game/tournaments/models/tournament.model';
import { append, patch, updateItem } from '@ngxs/store/operators';

const defaultState: ITournamentState = getDefaultTournamnetState();

@State<ITournamentState>({
  name: 'TournamentState',
  defaults: defaultState,
})
export class TournamentState implements NgxsOnInit {
  constructor() {}

  @Selector()
  static getCurrentTourID(state: ITournamentState): number {
    return state.currentTourID;
  }

  @Selector()
  static getTournament(state: ITournamentState) {
    return state.tournament;
  }

  @Selector()
  static getTournamentPlayers(state: ITournamentState) {
    return state.tournament && state.tournament.tournament_online_players;
  }

  @Selector()
  static getBoards(state: ITournamentState) {
    return state.boards;
  }

  @Selector()
  static getTours(state: ITournamentState) {
    return state.tours;
  }

  @Selector()
  static getStandings(state: ITournamentState) {
    return state.standings;
  }

  @Action(SetCurrentTourID)
  setCurrentTourID(ctx: StateContext<ITournamentState>, action: SetCurrentTourID) {
    if (action.currentTourID) {
      ctx.patchState({
        currentTourID: action.currentTourID,
      });
    }
  }

  @Action(SubscribeViewerByBoardID)
  subscribeViewerByBoardID(ctx: StateContext<ITournamentState>, action: SubscribeToBoardsByBoardID) {}

  @Action(UnsubscribeToBoardsByBoardID)
  unsubscribeViewerByBoardID(ctx: StateContext<ITournamentState>, action: UnsubscribeToBoardsByBoardID) {}

  @Action(SetOnlineTournament)
  setOnlineTournament(ctx: StateContext<ITournamentState>, action: SetOnlineTournament) {
    ctx.patchState({
      tournament: action.tournament,
    });
  }

  @Action(UpdateOnlineTournament)
  updateOnlineTournament(ctx: StateContext<ITournamentState>, action: UpdateOnlineTournament) {
    const tournamentState = ctx.getState().tournament;
    if (tournamentState.id === action.tournament.id) {
      const diffObject = this.diff(tournamentState, action.tournament);
      if (
        JSON.stringify(diffObject['tournament_online_players']) ===
        JSON.stringify(tournamentState.tournament_online_players)
      ) {
        delete diffObject['tournament_online_players'];
      }

      if (Object.keys(diffObject).length !== 0) {
        ctx.patchState({
          tournament: {
            ...tournamentState,
            ...diffObject,
          },
        });
      }
    } else {
      ctx.patchState({
        tournament: action.tournament,
      });
    }
  }

  @Action(SetBoardsTournament)
  setBoardsTournament(ctx: StateContext<ITournamentState>, action: SetBoardsTournament) {
    ctx.patchState({
      boards: action.boards,
    });
  }

  @Action(UpdateBoardsTournament)
  updateBoardsTournament(ctx: StateContext<ITournamentState>, action: UpdateBoardsTournament) {
    const stateBoards: IOnlineTournamentBoard[] = ctx.getState().boards;
    const actionBoards: IOnlineTournamentBoard[] = action.boards;
    const mapStateBoardIDs = stateBoards.map((board) => board.board_id);
    const mapActionBoardIDs = actionBoards.map((board) => board.board_id);
    const otherBoards = mapActionBoardIDs.filter((board) => !mapStateBoardIDs.includes(board));
    const differntBoards = mapActionBoardIDs.filter((board) => mapStateBoardIDs.includes(board));

    if (!this.isEqual(stateBoards, actionBoards)) {
      if (stateBoards.length === 0) {
        ctx.setState(
          patch({
            boards: append([...actionBoards]),
          })
        );
      } else {
        if (stateBoards.length !== actionBoards.length) {
          ctx.setState(
            patch({
              boards: append([
                ...otherBoards.map((boardId) => {
                  return actionBoards.find((board) => boardId === board.board_id);
                }),
              ]),
            })
          );
        }
        // Looking for the difference between two identical boards
        differntBoards.forEach((boardId) => {
          const otherBoard = actionBoards.find((board) => board.board_id === boardId);
          const stateBoard = stateBoards.find((board) => board.board_id === boardId);
          const diffState = this.diff(stateBoard, otherBoard);
          if (otherBoard && Object.keys(diffState).length !== 0 && Object.keys(diffState).length !== 1) {
            ctx.setState(
              patch({
                boards: updateItem<IOnlineTournamentBoard>((board) => board.board_id === boardId, otherBoard),
              })
            );
          }
        });
      }
    }
  }

  @Action(SetToursTournament)
  setToursTournament(ctx: StateContext<ITournamentState>, action: SetToursTournament) {
    ctx.patchState({
      tours: action.tours,
    });
  }

  @Action(UpdateToursTournament)
  updateToursTournament(ctx: StateContext<ITournamentState>, action: UpdateToursTournament) {
    const tours = ctx.getState().tours;
    if (tours) {
      if (!this.isEqual(tours, action.tours)) {
        ctx.patchState({
          tours: action.tours,
        });
      }
    } else {
      ctx.patchState({
        tours: action.tours,
      });
    }
  }

  @Action(SetStandings)
  setStandings(ctx: StateContext<ITournamentState>, action: SetStandings) {
    ctx.patchState({
      standings: action.standings,
    });
  }

  @Action(UpdateStandings)
  updateStandings(ctx: StateContext<ITournamentState>, action: UpdateStandings) {
    const state = ctx.getState();
    const actionStandings: IOnlineTournamentStandings[] = action.standings;

    ctx.setState(
      patch({
        standings: [...actionStandings],
      })
    );

    ctx.patchState({
      tournament: {
        ...state.tournament,
        signed_up_amount: actionStandings.length,
      },
    });
  }

  @Action(UpdateTournamentState)
  updateTournamentState(ctx: StateContext<ITournamentState>, action: UpdateTournamentState) {
    const tournamentState = ctx.getState().tournament;
    if (tournamentState.id === action.changeState.id) {
      delete action.changeState.id;

      ctx.patchState({
        tournament: {
          ...tournamentState,
          ...action.changeState,
        },
      });
    }
  }

  @Action(UpdateUserSigned)
  updateUserSigned(ctx: StateContext<ITournamentState>, action: UpdateUserSigned) {
    const tournamentState = ctx.getState().tournament;
    ctx.patchState({
      tournament: {
        ...tournamentState,
        user_signed: action.userSigned,
      },
    });
  }

  diff(obj1, obj2) {
    // Make sure an object to compare is provided
    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
      return obj1;
    }

    const diffs = {};
    let key;
    /**
     * Check if two arrays are equal
     * @param  {Array}   arr1 The first array
     * @param  {Array}   arr2 The second array
     * @return {Boolean}      If true, both arrays are equal
     */
    const arraysMatch = (arr1, arr2) => {
      // Check if the arrays are the same length
      if (arr1.length !== arr2.length) {
        return false;
      }

      // Check if all items exist and are in the same order
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }
      // Otherwise, return true
      return true;
    };

    /**
     * Compare two items and push non-matches to object
     * @param  {*}      item1 The first item
     * @param  {*}      item2 The second item
     * @param  {String} keyValue   The key in our object
     */
    const compare = (item1, item2, keyValue) => {
      // Get the object type
      const type1 = Object.prototype.toString.call(item1);
      const type2 = Object.prototype.toString.call(item2);

      // If type2 is undefined it has been removed
      if (type2 === '[object Undefined]') {
        diffs[keyValue] = null;
        return;
      }

      // If items are different types
      if (type1 !== type2) {
        diffs[keyValue] = item2;
        return;
      }

      // If an object, compare recursively
      if (type1 === '[object Object]') {
        const objDiff = this.diff(item1, item2);
        if (Object.keys(objDiff).length > 1) {
          diffs[keyValue] = objDiff;
        }
        return;
      }

      // If an array, compare
      if (type1 === '[object Array]') {
        if (!arraysMatch(item1, item2)) {
          diffs[keyValue] = item2;
        }
        return;
      }

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (type1 === '[object Function]') {
        if (item1.toString() !== item2.toString()) {
          diffs[keyValue] = item2;
        }
      } else {
        if (item1 !== item2) {
          diffs[keyValue] = item2;
        }
      }
    };

    //
    // Compare our objects
    //

    // Loop through the first object
    for (key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        compare(obj1[key], obj2[key], key);
      }
    }

    // Loop through the second object and find missing items
    for (key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (!obj1[key] && obj1[key] !== obj2[key]) {
          diffs[key] = obj2[key];
        }
      }
    }

    // Return the object of differences
    return diffs;
  }

  compare(item1, item2): boolean {
    const itemType = Object.prototype.toString.call(item1);

    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!this.isEqual(item1, item2)) {
        return false;
      }
    } else {
      if (itemType !== Object.prototype.toString.call(item2)) {
        return false;
      }
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) {
          return false;
        } else {
          if (item1 !== item2) {
            return false;
          }
        }
      }
    }
  }

  /**
   * Comparing two values
   * @param {*} value
   * @param {*} other
   * @returns {boolean}
   * @memberof TournamentState
   */
  isEqual(value, other): boolean {
    const typeValue = Object.prototype.toString.call(value);
    const typeOther = Object.prototype.toString.call(other);
    if (typeValue !== typeOther) {
      return false;
    }

    if (['[object Array]', '[object Object]'].indexOf(typeValue) < 0) {
      return false;
    }

    const valueLen = typeValue === '[object Array]' ? value.length : Object.keys(value).length;
    const otherLen = typeOther === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) {
      return false;
    }
    let match;
    if (typeValue === '[object Array]') {
      for (let i = 0; i < valueLen; i++) {
        if (this.compare(value[i], other[i]) === false) {
          return false;
        }
      }
    } else {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          if (this.compare(value[key], other[key]) === false) {
            return false;
          }
        }
      }
    }
    return true;
  }

  ngxsOnInit(ctx?: StateContext<ITournamentState>): void | any {
    return;
  }
}
function getDefaultTournamnetState(): ITournamentState {
  return {
    chatBoardId: null,
    tournamentID: null,
    currentTourID: 1,
    tournament: {
      id: 0,
      title: null,
      additional_title: null,
      slug: null,
      location: null,
      datetime_of_tournament: null,
      datetime_of_finish: null,
      tournament_type: 0,
      broadcast_type: 0,
      event: null,
      prize_fund: 0,
      prize_fund_currency: null,
      status: 0,
      image: null,
      sharing_fb: null,
      sharing_tw: null,
      about: null,
      press: null,
      contacts: null,
      product: null,
      organized_by: null,
      players_amount: 0,
      signup_start_datetime: null,
      signup_end_datetime: null,
      move_time_limit: 0,
      user_signed: false,
      available: false,
      promoted: false,
      time_control: null,
      players_rating_minimum: 0,
      players_rating_maximum: 0,
      signed_up_amount: 0,
      rating_type: null,
      country: null,
      tournament_online_players: [],
      defaults: null,
      number_of_tours: 0,
      faq_text: null,
      similar_tournaments: null,
      in_overlapped_tournament: null,
      sponsor_title: null,
      sponsor: null,
    },
    boards: null,
    tours: null,
    standings: null,
  };
}
