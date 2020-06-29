import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import { TabValue } from '../manage-tournament/manage-tournament';
import { SubscriptionHelper } from '../../../shared/helpers/subscription.helper';
import * as fromRoot from '../../../reducers';
import { TournamentResourceService } from '../../../broadcast/core/tournament/tournament-resource.service';
import { ITournamentWidget, TournamentWidgetsService } from '../../../broadcast/core/tournament/tournament-widgets.service';
import { ManageTournamentTabLinked } from '../manage-tournament/manage-tournament-linked';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'wc-manage-tournament-widgets',
  templateUrl: './manage-tournament-widgets.component.html',
  styleUrls: ['./manage-tournament-widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageTournamentWidgetsComponent extends ManageTournamentTabLinked<ITournamentWidget> implements OnInit, OnDestroy {
  // @TODO ask backend to return the linked boards

  selectedTabValue: TabValue = 'widgets';
  _loading = true;

  toursList$ = this.tournamentId$
    .pipe(switchMap((id) => this.tournamentResource.getMyTournamentTours(id)));

  tours = [];

  public mainUrl = environment.applicationUrl;

  constructor(protected route: ActivatedRoute,
    protected router: Router,
    protected cd: ChangeDetectorRef,
    protected store$: Store<fromRoot.State>,
    protected fb: FormBuilder,
    protected tournamentLoad: TournamentLoadService,
    private tournamentWidgetsService: TournamentWidgetsService,
    private tournamentResource: TournamentResourceService) {
    super(route, router, cd, store$, fb, tournamentLoad);
  }

  protected resourceGetEntities(tournamentId: number): Observable<ITournamentWidget[]> {
    return this.tournamentWidgetsService.getForTournament(tournamentId);
  }
  protected resourceDeleteEntity(tournamentId: number, widgetId: string): Observable<any> {
    return this.tournamentWidgetsService.deleteFromTournament(tournamentId, widgetId);
  }

  protected resourceAddEntity(tournamentId: number, widget: Partial<ITournamentWidget>): Observable<ITournamentWidget> {
    return this.tournamentWidgetsService.addForTournament(tournamentId, widget);
  }

  protected resourceSaveEntity(tournamentId: number, widget: Partial<ITournamentWidget>): Observable<ITournamentWidget> {
    return this.tournamentWidgetsService.updateForTournament(tournamentId, widget.id, widget);
  }

  get loading() {
    return this._loading;
  }

  // @TODO use this loading
  // set loading(value) {
  //   this._loading = value;
  //   this.form.controls.entities.forEach(control => {
  //     if (this._loading) {
  //       control.disable();
  //     } else {
  //       control.enable();
  //     }
  //   });
  // }

  ngOnInit() {
    this.initParams();
    this.initFormAndChanges();

    this.subs.tours = this.toursList$.subscribe((tours) => {
      this.tours = tours;
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  public createEmptyEntityForm(): FormGroup {
    return this.fb.group({
      tour: [null, Validators.required],
      match: [null]
    });
  }

  public setEntitiesList(widgets: ITournamentWidget[]) {
    const control = new FormArray([]);
    widgets.forEach((widget: ITournamentWidget) => {
      const { id, tour, match, is_active } = widget;
      control.push(this.fb.group({
        id,
        tour,
        match,
        is_active
      }));
    });
    control.push(this.createEmptyEntityForm());
    return control;
  }
}
