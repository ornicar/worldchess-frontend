import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Store, select} from '@ngrx/store';
import { ActivatedRoute, Router} from '@angular/router';
import { switchMap, take } from 'rxjs/operators';
import { isLastTab, ManageTournamentTab, TabValue, getNextTabValue } from '../manage-tournament/manage-tournament';
import * as fromRoot from '../../../reducers';
import { Subscriptions, SubscriptionHelper } from '../../../shared/helpers/subscription.helper';
import { TournamentManagerMode } from '../my-events/my-events.component';
import { selectOnlineTournamentErrors } from '../../../broadcast/core/tournament/tournament.reducer';
import { PartnersService } from '../../../partners/partners.service';
import { ITournamentPartner, TournamentPartnersService } from '../../../broadcast/core/tournament/tournament-partners.service';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';


@Component({
  selector: 'wc-manage-tournament-partners',
  templateUrl: './manage-tournament-partners.component.html',
  styleUrls: ['./manage-tournament-partners.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageTournamentPartnersComponent extends ManageTournamentTab implements OnInit, OnDestroy {
  selectedTabValue: TabValue = 'partners';
  _loading = false;

  partnersList$ = this.partnersService.getAllParnters();

  // @todo: emit errors from partmer form
  errors$ = this.store$.pipe(select(selectOnlineTournamentErrors));

  partnersForm: FormArray;
  private subscribers: Subscriptions = {};
  private rowChanged: number[] = [];
  private startFormValue: any = {};

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected cd: ChangeDetectorRef,
    protected store$: Store<fromRoot.State>,
    protected fb: FormBuilder,
    protected tournamentLoad: TournamentLoadService,
    private partnersService: PartnersService,
    private tournamentPartnersService: TournamentPartnersService) {
    super(route, router, cd, store$, fb, tournamentLoad);
  }

  get loading() {
    return this._loading;
  }

  set loading(value) {
    this._loading = value;
    this.partnersForm.controls.forEach(control => {
      if (this._loading) {
        control.disable();
      } else {
        control.enable();
      }
    });
  }

  ngOnInit() {
    this.initParams();
    this.subscribers.route = this.tournamentId$
      .pipe(
        switchMap(tournamentId => this.tournamentPartnersService.getForTournament(tournamentId))
      )
      .subscribe(
        (partners) => this.initPartnerForm(partners),
        () => {
        },
        () => {
          this.loading = false;
        });
  }

  private addNewPartnerControl() {
    this.partnersForm.push(new FormControl({
      id: null, partner: null, partner_cat: null, partner_seq: null
    }));
  }

  private initPartnerForm(partners: ITournamentPartner[]) {
    this.partnersForm = new FormArray([]);
    partners.forEach(p => {
      this.partnersForm.push(new FormControl(p));
    });
    this.addNewPartnerControl();

    this.startFormValue = this.partnersForm.getRawValue();
    this.subscribers.formChanges = this.partnersForm.valueChanges
      .subscribe((newValues) => {
        this.rowChanged = this.getChangedRowIndexs(this.startFormValue, newValues);
        this.cd.markForCheck();
      });

    this.cd.markForCheck();
  }

  private getChangedRowIndexs(oldValues, newValues) {
    return newValues
      .map((partner, index) => {
        const fieldChanges = Object.keys(partner)
          .reduce((acc, val) => {
            if (!oldValues[index] || oldValues[index][val] !== newValues[index][val]) {
              acc[val] = newValues[index][val];
            }
            return acc;
          }, {});
        return (Object.keys(fieldChanges).length) ? index : null;
      })
      .filter(index => index !== null);
  }

  addPartner() {
    this.partnersForm.updateValueAndValidity();
    if (this.partnersForm.invalid) {
      return;
    }
    const formValue = this.partnersForm.getRawValue() as ITournamentPartner[];
    const lastPartner = formValue[formValue.length - 1];
    if (!!lastPartner.id) {
      console.log(`partner already saved`);
      return;
    }

    this.loading = true;
    this.tournamentId$
      .pipe(
        switchMap(id => this.tournamentPartnersService.addForTournament(id, lastPartner))
      )
      .subscribe((partner) => {
        this.loading = false;
        this.partnersForm.removeAt(this.partnersForm.controls.length - 1);
        this.partnersForm.push(new FormControl(partner));
        this.addNewPartnerControl();
        this.startFormValue = this.partnersForm.getRawValue();
        this.cd.markForCheck();
      });
  }

  removePartner(controlIndex: number) {
    const partner = this.partnersForm.at(controlIndex).value;
    if (partner.id === null) {
      // Skip remove control for new partner
      return;
    }

    this.loading = true;
    this.tournamentId$
      .pipe(
        switchMap(id => this.tournamentPartnersService.deleteFromTournament(id, partner.id))
      )
      .subscribe(() => {
        this.partnersForm.removeAt(controlIndex);
        this.rowChanged = this.rowChanged.filter(i => i !== controlIndex);
        this.startFormValue = this.partnersForm.getRawValue();
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  updatePartner(controlIndex) {
    const control = this.partnersForm.at(controlIndex);

    if (control.invalid) {
      return;
    }

    this.loading = true;
    this.tournamentId$
      .pipe(
        switchMap(id => this.tournamentPartnersService.updateForTournament(id, control.value))
      )
      .subscribe(() => {
        this.loading = false;
        this.rowChanged = this.rowChanged.filter(index => index !== controlIndex);
        this.startFormValue = this.partnersForm.getRawValue();
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subscribers);
  }

  ableToNext() {
    return this.mode === TournamentManagerMode.CREATE && !isLastTab(this.selectedTabValue);
  }

  onSave(route = null) {
    if (this.partnersForm.invalid) {
      return null;
    }

    if (this.rowChanged.length > 0) {
      console.log(`Form has unsaved changes`);
      return null;
    }

    if (route !== null) {
      this.navigateToNextTab(route);
    }
  }

  ableToSend() {
    return this.mode === TournamentManagerMode.EDIT || isLastTab(this.selectedTabValue);
  }

  onClose() {
    this.router.navigate(['/account/events']);
  }

  ableToUpdatePartner(controlIndex: number) {
    return !!this.partnersForm.at(controlIndex).value
      && !!this.partnersForm.at(controlIndex).value.id
      && this.rowChanged.includes(controlIndex);
  }

  get isDisabledAddBtn() {
    if (!this.partnersForm || !this.partnersForm.controls.length) {
      return true;
    }

    const lastControl = this.partnersForm.controls[this.partnersForm.controls.length - 1];
    return !lastControl.value.partner
      || !lastControl.value.partner_cat
      || !(lastControl.value.partner_seq && lastControl.value.partner_seq > 0);
  }

  get isDisabledSaveAction() {
    if (!this.partnersForm || this.loading) {
      return true;
    }
    return this.partnersForm.invalid || this.rowChanged.length > 0;
  }

  onNext() {
    this.validationErrors = [];
    const route = getNextTabValue(this.selectedTabValue);
    this.navigateToNextTab(route);

    // @TODO use base class / base component for list with entities
    // todo view
  }

  navigateToNextTab(route) {
    this.tournamentId$.pipe(take(1)).subscribe((id) => {
      this.router.navigate([`/account/events/${this.mode}/${id}/${route}`]);
    });
  }
}
