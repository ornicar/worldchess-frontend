import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, Observable, of, combineLatest } from 'rxjs';
import { catchError, finalize, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as fromRoot from '@app/reducers';

import { BroadcastingType, IFounderCamera, OperationMode } from '@app/broadcast/core/camera/camera.model';
import { AccountResourceService } from '@app/account/account-store/account-resource.service';
import { ManageTournamentTab, TabValue } from '@app/account/account-module/manage-tournament/manage-tournament';
import { TournamentLoadService } from '@app/broadcast/core/tournament/tournament-load.service';
import { IFounderTour } from '@app/broadcast/core/tour/tour.model';
import { TournamentResourceService } from '@app/broadcast/core/tournament/tournament-resource.service';
import { SubscriptionHelper, Subscriptions } from '@app/shared/helpers/subscription.helper';


@Component({
  selector: 'wc-manage-tournament-cameras',
  templateUrl: './manage-tournament-cameras.component.html',
  styleUrls: ['./manage-tournament-cameras.component.scss'],
})
export class ManageTournamentCamerasComponent extends ManageTournamentTab implements OnInit, OnDestroy {
  selectedTabValue: TabValue = 'video_broadcast';

  savedCamerasForms: FormGroup[] = [];
  cameraForm: FormGroup;
  loading$ = new BehaviorSubject<boolean>(false);

  BroadcastingType = BroadcastingType;
  OperationMode = OperationMode;

  tours$: Observable<IFounderTour[]> = this.tournamentId$.pipe(
    switchMap((tournamentId: number) => {
      if (tournamentId) {
        return this.tournamentResourceService.getMyTournamentTours(tournamentId);
      }
      return of([]);
    })
  );

  responseErrors$ = new BehaviorSubject<{ [key: string]: string }>({});
  validationErrors$ = new BehaviorSubject<{ [key: string]: { [key: string]: any } }>({});

  formErrors$: Observable<any> = combineLatest(this.responseErrors$, this.validationErrors$).pipe(
    switchMap(([responseErrors, validationErrors]) => {
      const errors = {};
      if (this.cameraForm) {
        Object.keys(this.cameraForm.controls).forEach(key => {
          const controlResponseErrors = responseErrors && responseErrors[key] ? responseErrors[key] : null;
          const controlValidationErrors = validationErrors && validationErrors[key] ? validationErrors[key] : {};
          errors[key] = { response: controlResponseErrors, ...controlValidationErrors };
        });
      }
      return of(errors);
    }),
  );

  subs: Subscriptions = {};

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected cd: ChangeDetectorRef,
              protected store$: Store<fromRoot.State>,
              protected fb: FormBuilder,
              protected tournamentLoad: TournamentLoadService,
              private accountResourceService: AccountResourceService,
              private tournamentResourceService: TournamentResourceService) {
    super(route, router, cd, store$, fb, tournamentLoad);
  }

  createNewCameraForm() {
    return this.fb.group({
      tour: [null, [Validators.required]],
      link: ['', [Validators.required]],
      name: ['', [Validators.required]],
      is_default: [false],
      is_free: [false],
      operation_mode: [OperationMode.ONLINE],
      broadcasting_type: [BroadcastingType.YOUTUBE],
    });
  }

  ngOnInit() {
    this.add();
    this.subs.cameras = this.tours$.subscribe((tours: IFounderTour[]) => {
      this.savedCamerasForms = tours && tours.length ? tours.reduce((acc, curr) => {
        return [...acc, ...curr.cameras.map((c: IFounderCamera) => {
          const form = this.createNewCameraForm();
          form.patchValue(c);
          form.disable();
          return form;
        })];
      }, []) : [];
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  save(): Observable<any> {
    Object.values(this.cameraForm.controls).forEach(control => control.markAsDirty());
    if (this.cameraForm.valid) {
      const { tour, link, name, is_default, is_free, operation_mode, broadcasting_type } = this.cameraForm.value;

      return this.tournamentId$.pipe(
        take(1),
        switchMap((tournamentId: number) => {
          this.responseErrors$.next(null);
          this.loading$.next(true);
          return this.accountResourceService.createFounderCamera(tournamentId, {
            tour, link, name, is_default, is_free, operation_mode, broadcasting_type
          }).pipe(
            switchMap((result) => {
              if (result) {
                const newSavedForm = this.createNewCameraForm();
                newSavedForm.patchValue(this.cameraForm.value);
                newSavedForm.disable();
                this.savedCamerasForms = [newSavedForm, ...this.savedCamerasForms];
                this.cameraForm = null;
              }
              return of(result);
            }),
            catchError(({ error }) => {
              this.responseErrors$.next(error);
              return of(EMPTY);
            }),
            finalize(() => {
              this.loading$.next(false);
            }),
          );
        }),
      );
    } else {
      return of(EMPTY);
    }
  }

  add() {
    this.cameraForm = this.createNewCameraForm();
    if (this.subs.validation) {
      this.subs.validation.unsubscribe();
    }
    this.subs.validation = this.cameraForm.valueChanges.subscribe(() => {
      const errors = {};

      Object.keys(this.cameraForm.controls).forEach(key => {
        const control = this.cameraForm.controls[key];
        if (!control.dirty) {
          return;
        }
        if (control.errors) {
          errors[key] = { ...control.errors };
        }
      });

      this.validationErrors$.next(errors);
    });
  }

  onSave() {
    this.save().subscribe(() => {});
  }

  onSaveAndAdd() {
    this.save().subscribe(() => {
      this.add();
    });
  }
}


