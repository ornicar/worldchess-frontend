import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { plainToClass } from 'class-transformer';
import { EventOrganizer } from '../event/event.model';
import { IDefaultEntities } from '../models/default-entities';
import { TournamentActions, TournamentActionTypes } from './tournament.actions';
import {
  TournamentState,
  TournamentWishListEntry,
  TournamentResourceType,
  OnlineTournament,
  FounderTournament,
  Tournament,
  CommonTournament,
  ITournament,
} from './tournament.model';
import * as moment from 'moment';
import { IResultsLists } from '../result/result.model';


export interface IMyTournamentErrors {
  [field: string]: string[];
}
export interface ITournamentAllData {
  tournament: Partial<CommonTournament>;
  partners: any[];
  rounds: any[];
  widget: any;
}

export interface State extends EntityState<CommonTournament> {
  selectedTournamentId: number;
  defaults: {
    [id: number]: IDefaultEntities
  };
  myTournamentErrors: IMyTournamentErrors;
  results: IResultsLists;
  signedTournament: OnlineTournament;
  signupErrorMsg: string;
  wishList: TournamentWishListEntry[];
  wishListError: string;
}

export enum TournamentSortDateType {
  Ascending = 0,
  Descending = 1
}

const tournamentStateStateCache = new WeakMap<CommonTournament, TournamentState>();

export function getTournamentState(tournament: CommonTournament): TournamentState {
  if (tournamentStateStateCache.has(tournament)) {
    return tournamentStateStateCache.get(tournament);
  }

  const startDate = tournament.datetime_of_tournament
    ? moment(tournament.datetime_of_tournament)
    : null;

  const finishDate = tournament.datetime_of_finish
    ? moment(tournament.datetime_of_finish)
    : null;

  const now = moment();

  let state: TournamentState;

  if (!startDate) {
    state = TournamentState.TBD;
  } else if (startDate > now) {
    state = TournamentState.Start;
  } else if (finishDate && finishDate >= now) {
    state = TournamentState.Live;
  } else {
    state = TournamentState.Webcast;
  }

  tournamentStateStateCache.set(tournament, state);

  return state;
}

const tournamentStateSort = {
  [TournamentState.Live]: {
    weight: 10,
    type: TournamentSortDateType.Descending
  },
  [TournamentState.Webcast]: {
    weight: 9,
    type: TournamentSortDateType.Descending
  },
  [TournamentState.Start]: {
    weight: 8,
    type: TournamentSortDateType.Ascending
  },
  [TournamentState.TBD]: {
    weight: 7,
    type: TournamentSortDateType.Descending
  }
};

export function sortByState(a: CommonTournament, b: CommonTournament): number {
  const aState = getTournamentState(a);
  const bState = getTournamentState(b);

  return tournamentStateSort[bState].weight - tournamentStateSort[aState].weight;
}

export function sortByStartDate(
  a: CommonTournament,
  b: CommonTournament,
  type: TournamentSortDateType = TournamentSortDateType.Descending
): number {
  const aDate = a.datetime_of_tournament ? new Date(a.datetime_of_tournament).getTime() : 0;
  const bDate = b.datetime_of_tournament ? new Date(b.datetime_of_tournament).getTime() : 0;

  return type === TournamentSortDateType.Descending ? bDate - aDate : aDate - bDate;
}

export function sortByStartStateAndDate(a: CommonTournament, b: CommonTournament): number {
  const stateCompare = sortByState(a, b);

  if (stateCompare !== 0) {
    return stateCompare;
  } else {
    const bState = getTournamentState(b);

    return sortByStartDate(a, b, tournamentStateSort[bState].type);
  }
}

export const adapter: EntityAdapter<CommonTournament> = createEntityAdapter<CommonTournament>({
  // sortComparer: sortByStartDate
});

export function deserializeTournament(tournament: ITournament): CommonTournament {
  if (!tournament) {
    return plainToClass(Tournament, {});
  }

  switch (tournament.resourcetype) {
    case TournamentResourceType.OnlineTournament:
      return plainToClass(OnlineTournament, tournament);

    case TournamentResourceType.FounderTournament:
      return plainToClass(FounderTournament, tournament);

    default:
      return plainToClass(Tournament, tournament);
  }
}

export const initialState: State = adapter.getInitialState({
  selectedTournamentId: null,
  defaults: {},
  myTournamentErrors: null,
  results: <IResultsLists>{},
  signedTournament: null,
  signupErrorMsg: null,
  wishList: [],
  wishListError: null
});

export function reducer(
  state = initialState,
  action: TournamentActions
): State {

  switch (action.type) {
    case TournamentActionTypes.AddTournament: {
      return adapter.upsertOne(action.payload.tournament, state);
    }

    /*case TournamentActionTypes.UpsertTournament: {
      return adapter.upsertOne(action.payload.tournament, state);
    }*/

    case TournamentActionTypes.AddTournaments: {
      return adapter.addMany(action.payload.tournaments, state);
    }

    /*case TournamentActionTypes.UpsertTournaments: {
      return adapter.upsertMany(action.payload.tournaments, state);
    }*/

    case TournamentActionTypes.UpdateTournament: {
      return adapter.updateOne(action.payload.tournament, state);
    }

    case TournamentActionTypes.UpdateTournaments: {
      return adapter.updateMany(action.payload.tournaments, state);
    }

    case TournamentActionTypes.DeleteTournament: {
      return adapter.removeOne(action.payload.id, state);
    }

    case TournamentActionTypes.DeleteTournaments: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case TournamentActionTypes.LoadTournaments: {
      return adapter.addAll(action.payload.tournaments, state);
    }

    case TournamentActionTypes.ClearTournaments: {
      return adapter.removeAll(state);
    }

    case TournamentActionTypes.AddTournamentDefaultEntities: {
      return {
        ...state,
        defaults: {
          ...state.defaults,
          [action.payload.id]: action.payload.defaults
        }
      };
    }

    case TournamentActionTypes.SetSelectedTournament: {
      return {
        ...state,
        selectedTournamentId: action.payload.id
      };
    }

    case TournamentActionTypes.ClearSelectedTournament: {
      return {
        ...state,
        selectedTournamentId: null
      };
    }

    case TournamentActionTypes.SetMyTournamentErrors: {
      return {
        ...state,
        myTournamentErrors: action.payload.errors
      };
    }

    case TournamentActionTypes.ClearMyTournamentErrors: {
      return {
        ...state,
        myTournamentErrors: null
      };
    }

    case TournamentActionTypes.LoadTournamentResults: {
      return {
        ...state,
        results: action.payload.results,
      };
    }

    case TournamentActionTypes.SignupToTournamentSuccess: {
      return {
        ...state,
        signedTournament: action.payload.tournament
      };
    }

    case TournamentActionTypes.ClearSignedTournament: {
      return {
        ...state,
        signedTournament: null,
      };
    }

    case TournamentActionTypes.SignupToTournamentError: {
      return {
        ...state,
        signupErrorMsg: action.payload.message
      };
    }

    case TournamentActionTypes.SignupToTournamentErrorClear: {
      return {
        ...state,
        signupErrorMsg: null,
      };
    }

    case TournamentActionTypes.AddTournamentToWishList: {
      return {
        ...state,
        wishListError: null,
      };
    }

    case TournamentActionTypes.TournamentWishListSuccess: {
      return {
        ...state,
        wishListError: null,
      };
    }

    case TournamentActionTypes.TournamentWishListError: {
      return {
        ...state,
        wishListError: action.payload.message,
      };
    }

    case TournamentActionTypes.GetTournamentWishList: {
      return {
        ...state,
        wishListError: null,
      }
    }

    case TournamentActionTypes.LoadTournamentWishList: {
      return {
        ...state,
        wishListError: null,
        wishList: action.payload.wishList,
      }
    }

    default: {
      return state;
    }
  }
}

export const selectTournamentState = createFeatureSelector<State>('tournament');

export const {
  selectIds,
  selectEntities,
  selectAll: selectAllTournament,
  selectTotal,
} = adapter.getSelectors(selectTournamentState);

export const selectFideTournaments = createSelector(
  selectAllTournament,
  entities => entities.filter(entity => entity.organized_by === EventOrganizer.FIDE) as CommonTournament[],
);

export const selectOnlineTournaments = createSelector(
  selectAllTournament,
  entities => entities.filter(entity => entity.organized_by === EventOrganizer.ONLINE) as OnlineTournament[],
);

export const selectFounderTournaments = createSelector(
  selectAllTournament,
  entities => entities.filter(entity => entity.organized_by === EventOrganizer.FOUNDER) as FounderTournament[],
);

export const selectNoneFideTournaments = createSelector(
  selectAllTournament,
  entities => entities.filter(entity => entity.organized_by !== EventOrganizer.FIDE) as CommonTournament[]);

export const selectFideAndFounderTournaments = createSelector(
  selectAllTournament,
  entities => entities.filter(entity => (
    entity.resourcetype === TournamentResourceType.Tournament ||
    entity.resourcetype === TournamentResourceType.FounderTournament
  )
  ) as FounderTournament[]);

export const selectTournament = () => createSelector(selectEntities, (entities, { tournamentId }) =>
  entities[tournamentId] && entities[tournamentId].organized_by === EventOrganizer.FOUNDER
    ? entities[tournamentId]
    : null
);

export const selectOnlineSignedTournament = createSelector(selectTournamentState, state => state.signedTournament  as OnlineTournament);

export const selectTournamentsDefaultEntities = createSelector(selectTournamentState, store => store.defaults);

export const selectOnlineTournamentErrors = createSelector(selectTournamentState, store => store.myTournamentErrors);

export const selectOnlineTournamentSignupErrorMsg = createSelector(selectTournamentState, state => state.signupErrorMsg);

export const selectTournamentResults = createSelector(selectTournamentState, store => store.results);

export const selectTournamentsByIds = () => createSelector(selectEntities, (entities, { ids }) => ids.map(id => entities[id]));

export const selectFounderTournamentsByFounder = () => createSelector(selectFounderTournaments,
  (entities, { accountId }) => entities.filter(((entity: FounderTournament) => entity.founder === accountId))
);

export const selectAddToWishListError = createSelector(selectTournamentState, state => state.wishListError);

export const selectTournamentWishList = createSelector(selectTournamentState, state => state.wishList);

export const selectById = createSelector(selectTournamentState, (state, { id }) => state.entities[id]);
