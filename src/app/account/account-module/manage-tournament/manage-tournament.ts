import { TournamentManagerMode } from '../my-events/my-events.component';
import { Subscriptions } from '../../../shared/helpers/subscription.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import * as fromRoot from '../../../reducers';
import { map, switchMap, startWith, pairwise, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { selectTournament, selectOnlineTournamentErrors } from '../../../broadcast/core/tournament/tournament.reducer';
import {
  CreateMyTournament,
  PatchMyTournament,
  PatchMyTournamentAndNavigate,
  SendToApproveMyTournament
} from '../../../broadcast/core/tournament/tournament.actions';
import { FounderTournament, ApprovalStatus } from '../../../broadcast/core/tournament/tournament.model';

export const selectMode = (modeName) => {
  switch (modeName) {
    case 'create':
      return TournamentManagerMode.CREATE;
    case 'edit':
      return TournamentManagerMode.EDIT;
    case 'view':
      return TournamentManagerMode.VIEW;
    default: return TournamentManagerMode.CREATE;
  }
};

export type TabValue = 'main'
  | 'added'
  | 'partners'
  | 'payments'
  | 'players'
  | 'rounds'
  | 'widgets';

export const tournamentManagerTabs: ITournamentManagerTab[] = [
  { value: 'main', title: 'Main options' },
  { value: 'added', title: 'Added options' },
  // { value: 'partners', title: 'Partners' },
  { value: 'payments', title: 'Payments' },
  { value: 'players', title: 'Players' },
  { value: 'rounds', title: 'Rounds' },
  // { value: 'widgets', title: 'Widget' }
];

export const isLastTab = (selectedTabValue) => selectedTabValue === tournamentManagerTabs[tournamentManagerTabs.length - 1].value;

export const getTabNumber = (value) => tournamentManagerTabs.findIndex(item => item.value === value);

export const getNextTabValue = (currentValue) => {
  const tabNumber = getTabNumber(currentValue);
  return tabNumber < tournamentManagerTabs.length - 1 ? tournamentManagerTabs[getTabNumber(currentValue) + 1].value : '';
};

export interface ITournamentManagerTab {
  value: TabValue;
  title: string;
}


export abstract class ManageTournamentTab {
  protected subs: Subscriptions = {};
  mode: TournamentManagerMode = TournamentManagerMode.CREATE;
  isNextDisabled = false;

  selectedTabValue: TabValue;
  selectedTournamentId = 0;
  // may be we can use tournamentId$ observable instead

  tournamentId$ = this.route.parent.url.pipe(
    map((params) => +params[1].path)
  );
  tournament$ = this.tournamentId$.pipe(
    switchMap((tournamentId) => {
      if (tournamentId) {
        return this.tournamentLoad.getFounderWhenLacking(tournamentId);
      } else {
        return of(null);
      }
    })
  );

  tournamentMode$ = this.tournament$.pipe(
    map((tournament: FounderTournament) => tournament.approve_status)
  );

  readOnly$ = this.tournamentMode$.pipe(
    map((mode: ApprovalStatus) => !(mode === ApprovalStatus.NOT_APPROVED))
  );
  selectTournament = selectTournament();



  errors$ = this.store$.pipe(
    select(selectOnlineTournamentErrors),
    tap((errors) => {
      if (errors) {
        this.isNextDisabled = false;
      }
    })
  );

  validationErrors = [];

  form: FormGroup;
  changes;

  constructor(protected route: ActivatedRoute,
    protected router: Router,
    protected cd: ChangeDetectorRef,
    protected store$: Store<fromRoot.State>,
    protected fb: FormBuilder,
    protected tournamentLoad: TournamentLoadService) {
  }

  public setChanges(oldValues, newValues) {
    if (oldValues) {
      this.changes = {
        ...(this.changes || {}),
        ...Object.keys(oldValues)
          .reduce((acc, val) => {
            if (oldValues[val] !== newValues[val]) {
              acc[val] = newValues[val];
            }
            return acc;
          }, {})
      };
      this.cd.markForCheck();
    }
  }

  onNext() {
    this.isNextDisabled = true;
    this.validationErrors = [];

    if (this.selectedTabValue === 'main') {
      this.createNewTournament();
    } else {
      const route = getNextTabValue(this.selectedTabValue);
      if (this.changes) {
        this.onSave(route);
      } else {
        this.navigateToNextTab(route);
      }

    }

    // todo view
  }

  navigateToNextTab(route) {
    this.tournamentId$.pipe(take(1)).subscribe((id) => {
      this.router.navigate([`/account/events/create/${id}/${route}`]);
    });
  }

  createNewTournament() {
    // add time validation!
    if (this.form.valid) {
      this.store$.dispatch(new CreateMyTournament({ tournament: this.changes }));
    } else {
      // @TODO when separete controls will be implemented, error would be in every component itself
      this.getValidationErrors();
    }
  }

  onSave(route = null) {
    this.validationErrors = [];
    if (this.form.valid) {
      Object.keys(this.changes || {}).forEach(key => {
        if (this.changes[key] === '') { this.changes[key] = null; }
      });
      this.tournamentId$.pipe(take(1)).subscribe((
        tournamentId => {
          if (route) {
            this.store$.dispatch(new PatchMyTournamentAndNavigate({ id: tournamentId, changes: this.changes, route }));
          } else {
            this.store$.dispatch(new PatchMyTournament({ id: tournamentId, changes: this.changes }));
          }
          this.changes = null;
        }
      ));
    } else {
      this.getValidationErrors();
    }
    // TODO view;
  }

  getValidationErrors() {
    const controls = this.form.controls;
    this.validationErrors = Object.keys(controls)
      .reduce((acc, currentKey) => {
        const errors = controls[currentKey].errors;
        if (errors) {
          acc.push({
            name: currentKey,
            errors: Object.keys(errors).map((key) => ({ name: key, text: errors[key] }))
          });
        }
        return acc;
      }, []);

    this.isNextDisabled = false;
    this.cd.markForCheck();
  }

  ableToNext() {
    return this.mode === TournamentManagerMode.CREATE && !isLastTab(this.selectedTabValue);
  }

  ableToSave() {
    return this.mode === TournamentManagerMode.EDIT || isLastTab(this.selectedTabValue);
  }

  isSaveDisabled() {
    return !this.changes;
  }


  onClose() {
    this.router.navigate(['/account/events']);
  }

  onSendToApprove() {
    this.tournamentId$.pipe(take(1)).subscribe((id) => {
      this.store$.dispatch(new SendToApproveMyTournament({ id }));
    });
  }

  ableToSend() {
    return this.mode === TournamentManagerMode.EDIT || isLastTab(this.selectedTabValue);
  }

  public initFormByTournament(tournament: FounderTournament): FormGroup {
    return null;
    // template to initForm()
  }

  public initParams() {
    this.subs.route = this.route.parent.url.subscribe((params) => {
      this.mode = selectMode(params[0].path);
      this.cd.markForCheck();
    });
  }

  public initFormAndChanges() {
    this.subs.tournament = this.tournament$.pipe(
      map((tournament) => this.initFormByTournament(tournament)),
      tap((form) => {
        this.subs.changes = form.valueChanges.pipe(
          startWith(form.value),
          pairwise()
        ).subscribe(([oldValues, newValues]) => {
          this.setChanges(oldValues, newValues);
        });
      })
    ).subscribe(form => {
      this.form = form;
      this.cd.markForCheck();
    });
  }
}
