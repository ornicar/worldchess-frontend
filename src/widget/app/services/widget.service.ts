import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBoard, IBoardWithExpandAll } from '../../../app/broadcast/core/board/board.model';
import { IMatch } from '../../../app/broadcast/core/match/match.model';
import { ITour } from '../../../app/broadcast/core/tour/tour.model';
import { Tournament } from '../../../app/broadcast/core/tournament/tournament.model';
import { environment } from '../../../environments/environment';

export interface IWidget {
  tournament: Tournament['id'];
  tour?: ITour['id'];
  match?: IMatch['id'];
  board?: IBoard['id'];
  is_active: boolean;
  name: string;
  url: string;
  id: string; // uuid
}

export interface IWidgetWithExpandAll {
  tournament: Tournament;
  tour?: ITour;
  match?: IMatch;
  board?: IBoardWithExpandAll;
  is_active: boolean;
  name: string;
  url: string;
  id: string; // uuid
}

export interface IWidgetResponseEntities {
  widget: IWidget;
  tournament: Tournament;
  tour?: ITour;
  match?: IMatch;
  board?: IBoardWithExpandAll;
}

export interface IWidgetResponseAllEntities {
  widgets: IWidget[];
  tournaments: Tournament[];
  tours: ITour[];
  matches: IMatch[];
  boards: IBoardWithExpandAll[];
}

@Injectable()
export class WidgetService {

  private readonly API = environment.endpoint;

  constructor(private httpClient: HttpClient) {
  }

  public expandWidget(widgetData: IWidgetWithExpandAll): IWidgetResponseEntities {
    const {tournament, tour, match, board} = widgetData;

    const widget: IWidget = {
      ...widgetData,
      tournament: tournament.id,
      tour: tour ? tour.id : null,
      match: match ? match.id : null,
      board: board ? board.id : null
    };

    return {
      widget,
      tournament,
      tour,
      match,
      board
    } as IWidgetResponseEntities;
  }

  getAllWithExpandAllWidgets(): Observable<IWidgetResponseAllEntities> {
    return this.httpClient.get<IWidgetWithExpandAll[]>(`${this.API}/widgets/`).pipe(
      map((widgetsData) => {
        const accumulator: IWidgetResponseAllEntities = {
          widgets: [],
          tournaments: [],
          tours: [],
          matches: [],
          boards: [],
        };

        widgetsData
          .map(widgetData => this.expandWidget(widgetData))
          .forEach(({ widget, tournament, tour, match, board}) => {
            accumulator.widgets.push(widget);
            accumulator.tournaments.push(tournament);

            if (tour) {
              accumulator.tours.push(tour);
            }

            if (match) {
              accumulator.matches.push(match);
            }

            if (board) {
              accumulator.boards.push(board);
            }
          });

        return accumulator;
      })
    );
  }

  getWidgetWithExpandAllById(id: string): Observable<IWidgetResponseEntities> {
    return this.httpClient.get<IWidgetWithExpandAll>(`${this.API}/widgets/${id}/`).pipe(
      map((widgetData: IWidgetWithExpandAll) => this.expandWidget(widgetData))
    );
  }
}
