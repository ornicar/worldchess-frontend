import { IOnlineTournament, IOnlineTournamentBoard, IOnlineTournamentStandings } from './tournament.model';
import { ITour } from '@app/broadcast/core/tour/tour.model';

export interface ITournamentState {
  chatBoardId?: string;
  tournamentID: number;
  currentTourID: number;
  tours: ITour[];
  tournament: IOnlineTournament;
  boards: IOnlineTournamentBoard[];
  standings: IOnlineTournamentStandings[];
}
