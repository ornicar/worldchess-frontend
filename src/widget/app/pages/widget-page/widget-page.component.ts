import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { ITour } from '../../../../app/broadcast/core/tour/tour.model';
import * as fromTour from '../../../../app/broadcast/core/tour/tour.reducer';
import { Tournament } from '../../../../app/broadcast/core/tournament/tournament.model';
import * as fromTournament from '../../../../app/broadcast/core/tournament/tournament.reducer';
import * as fromRoot from '../../../../app/reducers/index';
import { WidgetLifeCycleService } from '../../services/widget-life-cycle.service';
import * as fromWidget from '../../services/widget.reducer';
import { IWidget } from '../../services/widget.service';

@Component({
  selector: 'wc-widget-page',
  templateUrl: './widget-page.component.html',
  styleUrls: ['./widget-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetPageComponent {
  private selectWidget = fromWidget.selectWidget();
  private selectTour = fromTour.selectTour();
  private selectTournament = fromTournament.selectTournament();

  public widgetId$ = this.route.params.pipe(
    map(params => params['uuid']),
    distinctUntilChanged(),
    filter(uuid => !!uuid),
  );

  public widget$: Observable<IWidget> = this.widgetId$.pipe(
    switchMap((id: string) => this.widgetLifeCycle.load(id)),
    switchMap(widget => this.store$.pipe(
      select(this.selectWidget, { widgetId: widget.id })
    )),
    shareReplay(1)
  );

  public tournament$: Observable<Tournament> = this.widget$.pipe(
    map((widget: IWidget) => widget.tournament),
    switchMap(id => this.store$.pipe(
      select(this.selectTournament, { tournamentId: id })
      )
    )
  );

  public tour$: Observable<ITour> = this.widget$.pipe(
    map((widget: IWidget) => widget.tour),
    switchMap((tourId) => this.store$.pipe(
      select(this.selectTour, { tourId })
    ))
  );

  constructor(
    private route: ActivatedRoute,
    private store$: Store<fromRoot.State>,
    private widgetLifeCycle: WidgetLifeCycleService
  ) { }
}
