import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CommonTournament } from '../../core/tournament/tournament.model';
import { IEvent } from '../../core/event/event.model';
import { ITour } from '../../core/tour/tour.model';
import { IMatch } from '../../core/match/match.model';
import { IBoard } from '../../core/board/board.model';
import { HeaderActions, HeaderActionTypes } from './header.actions';

interface TournamentState extends EntityState<CommonTournament> {}
const tournamentAdapter = createEntityAdapter<CommonTournament>();

interface EventState extends EntityState<IEvent> {}
const eventAdapter = createEntityAdapter<IEvent>();

interface TourState extends EntityState<ITour> {}
const tourAdapter = createEntityAdapter<ITour>();

interface MatchState extends EntityState<IMatch> {}
const matchAdapter = createEntityAdapter<IMatch>();

interface BoardState extends EntityState<IBoard> {}
const boardAdapter = createEntityAdapter<IBoard>();

export interface State {
  tournaments: TournamentState;
  events: EventState;
  tours: TourState;
  matches: MatchState;
  boards: BoardState;
}

const initialState: State = {
  tournaments: tournamentAdapter.getInitialState(),
  events: eventAdapter.getInitialState(),
  tours: tourAdapter.getInitialState(),
  matches: matchAdapter.getInitialState(),
  boards: boardAdapter.getInitialState()
};

export function reducer(state: State = initialState, action: HeaderActions): State {
  switch (action.type) {

    case HeaderActionTypes.LoadTournaments:
      return {
        ...state,
        tournaments: tournamentAdapter.addAll(action.payload.tournaments, state.tournaments),
      };

    case HeaderActionTypes.LoadEvents:
      return {
        ...state,
        events: eventAdapter.addAll(action.payload.events, state.events),
      };

    case HeaderActionTypes.LoadTours:
      return {
        ...state,
        tours: tourAdapter.addAll(action.payload.tours, state.tours),
      };

    case HeaderActionTypes.LoadMatches:
      return {
        ...state,
        matches: matchAdapter.addAll(action.payload.matches, state.matches),
      };

    case HeaderActionTypes.LoadBoards:
      return {
        ...state,
        boards: boardAdapter.addAll(action.payload.boards, state.boards),
      };

    default:
      return state;
  }
}

export const selectHeaderState = createFeatureSelector<State>('header');

export const selectTournamentState = createSelector(selectHeaderState, (state: State) => state.tournaments);
export const { selectAll: selectAllTournaments } = tournamentAdapter.getSelectors(selectTournamentState);

export const selectEventState = createSelector(selectHeaderState, (state: State) => state.events);
export const { selectAll: selectAllEvents } = eventAdapter.getSelectors(selectEventState);

export const selectTourState = createSelector(selectHeaderState, (state: State) => state.tours);
export const { selectAll: selectAllTours } = tourAdapter.getSelectors(selectTourState);

export const selectMatchState = createSelector(selectHeaderState, (state: State) => state.matches);
export const { selectAll: selectAllMatches } = matchAdapter.getSelectors(selectMatchState);

export const selectBoardState = createSelector(selectHeaderState, (state: State) => state.boards);
export const { selectAll: selectAllBoards } = boardAdapter.getSelectors(selectBoardState);
