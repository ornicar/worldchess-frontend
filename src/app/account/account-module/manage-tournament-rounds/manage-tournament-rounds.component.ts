import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { SubscriptionHelper } from '../../../shared/helpers/subscription.helper';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import { TabValue } from '../manage-tournament/manage-tournament';
import { TournamentResourceService } from '../../../broadcast/core/tournament/tournament-resource.service';
import { BoardType, TourStatus, ITour } from '../../../broadcast/core/tour/tour.model';
import { ManageTournamentTabLinked } from '../manage-tournament/manage-tournament-linked';
import { isNumber } from 'util';


@Component({
  selector: 'wc-manage-tournament-rounds',
  templateUrl: './manage-tournament-rounds.component.html',
  styleUrls: ['./manage-tournament-rounds.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ManageTournamentRoundsComponent extends ManageTournamentTabLinked<ITour> implements OnInit, OnDestroy {
  selectedTabValue: TabValue = 'rounds';

  fileLoadResponse = {};

  boardTypes = [
    { value: BoardType.CLASSIC, title: 'Classic' },
    { value: BoardType.RAPID, title: 'Rapid' },
    { value: BoardType.BLITZ, title: 'Blits' },
    { value: BoardType.ARMAGEDDON, title: 'Armageddon' },
  ];
  // @TODO put these arrays in tour model
  tourStatuses = [
    { value: TourStatus.EXPECTED, title: 'Expected' },
    { value: TourStatus.GOES, title: 'Goes' },
    { value: TourStatus.COMPLETED, title: 'Completed' },
  ];

  get roundsControls(): AbstractControl[] {
    return (<FormArray>this.form.get('entities') as FormArray).controls;
  }

  protected resourceGetEntities(tournamentId: number): Observable<ITour[]> {
    return this.tournamentResource.getMyTournamentTours(tournamentId);
  }

  protected resourceDeleteEntity(tournamentId: number, tourId: number): Observable<any> {
    return this.tournamentResource.deleteMyTournamentTour(tournamentId, tourId);
  }


  protected resourceAddEntity(tournamentId: number, tour: Partial<ITour>): Observable<ITour> {
    return this.tournamentResource.addMyTournamentTour(tournamentId, tour);
  }

  protected resourceSaveEntity(tournamentId: number, tour: Partial<ITour>): Observable<ITour> {
    return this.tournamentResource.patchMyTournamentTour(tournamentId, tour.id, tour);
  }


  constructor(protected route: ActivatedRoute,
    protected router: Router,
    protected cd: ChangeDetectorRef,
    protected store$: Store<fromRoot.State>,
    protected fb: FormBuilder,
    protected tournamentLoad: TournamentLoadService,
    private tournamentResource: TournamentResourceService) {
    super(route, router, cd, store$, fb, tournamentLoad);
  }

  ngOnInit() {
    this.initParams();
    this.initFormAndChanges();
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  public createEmptyEntityForm(): FormGroup {
    return this.fb.group({
      tour_number: [null, Validators.required],
      status: [null, Validators.required],
      datetime_of_round: [null, Validators.required],
      datetime_of_round_finish: [null, Validators.required],
      board_type: [null, Validators.required],
      links: this.fb.array([]), // @TODO if empty, delete
      time_control: this.fb.group({
        start_time: [null, [Validators.required]],
        black_start_time: [null, [Validators.required]],
        additional_time: [null, [Validators.required]],
        increment: [null, [Validators.required]],
        additional_time_move: [0, [Validators.required]],
        increment_start_move: [0, [Validators.required]],
      })
    }, {
      updateOn: 'change',
    });
  }

  setEntitiesList(tours: ITour[]) {
    const control = new FormArray([]);
    tours.sort((a, b) => a.tour_number - b.tour_number);
    tours.forEach((tour: ITour) => {
      const { id, status, tour_number, board_type, datetime_of_round, datetime_of_round_finish } = tour;
      control.push(this.fb.group({
        id: [id, [Validators.required]],
        status: [status, [Validators.required]],
        tour_number: [tour_number, [Validators.required]],
        board_type: [board_type, [Validators.required]],
        datetime_of_round: [datetime_of_round, [Validators.required]],
        datetime_of_round_finish: [datetime_of_round_finish, [Validators.required]],
        links: this.setLinks(tour),
        time_control: this.setTimeControl(tour)
      }, {
        updateOn: 'change',
      }));
    });

    control.push(this.createEmptyEntityForm());
    return control;
  }

  setLinks(tour: Partial<ITour>) {
    const arr = new FormArray([]);
    tour.links.forEach(link => {
      arr.push(this.fb.group({
        link
      }));
    });
    return arr;
  }

  addLink(round: FormGroup) {
    const links = <FormArray>round.controls.links;
    links.push(
      this.fb.group({
        link: [null, Validators.required]
      })
    );
    round.markAsDirty();
    round.updateValueAndValidity();
    this.cd.markForCheck();
  }

  deleteLink(round: FormGroup, i: number) {
    const links = <FormArray>round.controls.links;
    links.removeAt(i);
    this.cd.markForCheck();
  }

  setTimeControl({ time_control }: Partial<ITour>) {
    return this.fb.group({
      start_time: [time_control.start_time, [Validators.required]],
      black_start_time: [time_control.black_start_time || null, [Validators.required]],
      additional_time: [time_control.additional_time, [Validators.required]],
      increment: [time_control.increment, [Validators.required]],
      additional_time_move: [time_control.additional_time_move, [Validators.required]],
      increment_start_move: [time_control.increment_start_move, [Validators.required]],
    });
  }

  onBoardsLoad(files: any[], tourId: number) {
    const file = files[0];
    this.tournamentId$.pipe(
      take(1),
      switchMap((tournamentId) => this.tournamentResource.importBoard(tournamentId, tourId, file)),
    ).subscribe((response: { loaded: number, errors: Object, warnings: Object }) => {
      this.fileLoadResponse = {
        ...this.fileLoadResponse,
        [tourId]: response
      };
      this.cd.markForCheck();
    }, error => console.log('Error on boards uploading: ', error));
  }

  // MOVE TO HELPERS
  getDateForInput(form: FormGroup, controlName: string) {
    const value = form.get(controlName).value;
    return value ? value.slice(0, 16) : null;
  }

  public onNext(): void {
    const entity = this.getEntity(this.getLastIndex());
    let obs: Observable<ITour>;

    if (isNumber(entity.controls.id)) {
      obs = this.saveOneToServer(this.getLastIndex());
    } else {
      obs = this.addLastToServer();
    }

    obs.subscribe(() => super.onNext());
  }

  public onSendToApprove(): void {
    const entity = this.getEntity(this.getLastIndex());
    let obs: Observable<ITour>;

    if (isNumber(entity.controls.id)) {
      obs = this.saveOneToServer(this.getLastIndex());
    } else {
      obs = this.addLastToServer();
    }

    obs.subscribe(() => super.onSendToApprove());

  }

}
