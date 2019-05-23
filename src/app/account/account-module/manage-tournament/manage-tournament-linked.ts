import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { switchMap, map, tap, take } from 'rxjs/operators';
import { Subscriptions } from '../../../shared/helpers/subscription.helper';
import { ManageTournamentTab, getNextTabValue } from './manage-tournament';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import * as fromRoot from '../../../reducers';


interface EntityWithId {
  id: number | string;
}

const getDefinitionErrorText = (objectToDefine: string) => `Need to define '${objectToDefine} in a child class!`;

export abstract class ManageTournamentTabLinked<T extends EntityWithId> extends ManageTournamentTab {
  protected subs: Subscriptions = {};
  protected resourceService;

  constructor(protected route: ActivatedRoute,
    protected router: Router,
    protected cd: ChangeDetectorRef,
    protected store$: Store<fromRoot.State>,
    protected fb: FormBuilder,
    protected tournamentLoad: TournamentLoadService) {
    super(route, router, cd, store$, fb, tournamentLoad);
  }

  public initFormAndChanges(): void {
    this.subs.tournament = this.tournamentId$.pipe(
      switchMap((tournamentId) => this.resourceGetEntities(tournamentId)),
      map((entities: T[]) => this.fb.group({ entities: this.setEntitiesList(entities) })),
      tap((form: FormGroup) => {
        this.subs.changes = form.valueChanges.subscribe((changes) => {
          this.changes = this.getChangedRowIndexs();
          this.cd.markForCheck();
        });
      })
    ).subscribe((form: FormGroup) => {
      this.form = form;
      this.cd.markForCheck();
    });
  }

  setEntitiesList(entities: T[]): FormArray {
    throw new Error(getDefinitionErrorText('setEntitiesList'));
  }

  // manipulations


  public createEmptyEntityForm(): FormGroup {
    throw new Error(getDefinitionErrorText('getEmtpy'));
  }

  public setToUnchanged(idx: number): void {
    const entity = this.getEntity(idx);
    entity.markAsPristine();
    delete (this.changes[idx]);
    this.cd.markForCheck();
  }

  public saveOne(idx: number): void {
    this.saveOneToServer(idx)
      .subscribe(() => {
        this.setToUnchanged(idx);
      });
  }

  public saveLastAndAddNew(): void {
    this.addLastToServer()
      .subscribe((entity: T) => {
        this.patchLast(entity);
        this.setToUnchanged(this.getLastIndex());
        this.addEmpty();
      });
  }


  public addEmpty(): void {
    const entities = this.getFormArray();
    entities.push(this.createEmptyEntityForm());
    this.cd.markForCheck();
  }


  public deleteOne(idx: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      const entities = this.getFormArray();
      if (entities) {
        const id = entities.at(idx).value.id;
        this.deleteOneFromServer(id).subscribe(() => {
        entities.removeAt(idx);
        this.setToUnchanged(idx);
        this.cd.markForCheck();
      });
      }
    }
  }

  public patchLast(entity: T): void {
    const lastIndex = this.getLastIndex();
    const entityForm = this.getEntity(lastIndex);

    entityForm.addControl('id', this.fb.control(entity.id));
    this.setToUnchanged(lastIndex);
  }


  // API

  protected addLastToServer(): Observable<T> {
    const entity = this.getEntity(this.getLastIndex());
    return this.tournamentId$.pipe(
      take(1),
      switchMap(tournamentId => this.resourceAddEntity(tournamentId, entity.value))
    );
  }

  protected saveOneToServer(idx: number): Observable<T> {
    const entity = this.getEntity(idx);
    return this.tournamentId$.pipe(
      take(1),
      switchMap(tournamentId => this.resourceSaveEntity(tournamentId, entity.value))
    );
  }

  private deleteOneFromServer(id: number | string): Observable<any> {
    return this.tournamentId$.pipe(
      take(1),
      switchMap(tournamentId => this.resourceDeleteEntity(tournamentId, id))
    );
  }

  // NEED TO DEFINE:
  protected resourceGetEntities(tournamentId: number): Observable<T[]> {
    throw new Error(getDefinitionErrorText('resourceGetEntities'));
  }

  protected resourceDeleteEntity(tournamentId: number, id: number | string): Observable<any> {
    throw new Error(getDefinitionErrorText('resourceDeleteEntity'));
  }

  protected resourceAddEntity (tournamentId: number, entity: Partial<T>): Observable<T> {
    throw new Error(getDefinitionErrorText('resourceAddEntity'));
  }

  protected resourceSaveEntity (tournamentId: number, entity: Partial<T>): Observable<T> {
    throw new Error(getDefinitionErrorText('resourceSaveEntity'));
  }

  // checks
  public isSaved(idx: number): boolean {
    const entity = this.getEntity(idx);
    return !!entity && !!entity.value && !!entity.value.id;
  }

  public isAddNewDisabled(): boolean {
    if (!this.form) { return true; }

    const entity = this.getEntity(this.getLastIndex());
    return !entity || entity.invalid;
  }

  public isSaveOneAvailable(idx: number): boolean {
    // ADD VALIDATION
    const entity = this.getEntity(idx);
    return !!this.changes && !!this.changes[idx] && this.isSaved(idx) && entity.valid;
  }


  public ableToSave(): boolean {
    return false;
  }

  // actions
  onNext(): void {
    const route = getNextTabValue(this.selectedTabValue);
    this.navigateToNextTab(route);
  }

  ableToNext(): boolean {
    return false;
  }
  // helpers

  getErrors(errorsObj: {[key: string]: any }): Array<{name: string, value: any}> {
    return Object.keys(errorsObj).map((key) => ({ name: key, value: errorsObj[key] }));
  }

  public getFormArray(): FormArray {
    return <FormArray>this.form.controls.entities;
  }

  protected getLastIndex(): number {
    const entities = this.getFormArray();
    return entities ? entities.length - 1 : 0;
  }

  protected getEntity(idx: number): FormGroup {
    const entities = this.getFormArray();
    return entities ? <FormGroup>entities.at(idx) : null;
  }

  private getChangedRowIndexs(): Object {
    const entities = this.getFormArray();
    return entities ? entities.controls
      .reduce((acc, control, index) => {
        if (control.dirty) {
          return { ...acc, [index]: true };
        } else {
          return acc;
        }
      }, {}) : null;
  }
}
