import { AbstractControlOptions, AsyncValidatorFn, FormControl, ValidatorFn } from '@angular/forms';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';

export class PaygateFormControl extends FormControl {

  input$ = new BehaviorSubject(false);
  empty$ = this.input$.pipe(map(() => !this.value));
  valid$ = combineLatest(
    this.statusChanges,
    this.input$,
  ).pipe(
    map(([status, input]) => input ? true : status === 'VALID'),
  );
  invalid$ = this.valid$.pipe(map(valid => !valid));

  private _errors$ = new BehaviorSubject(null);
  errors$ = this.valid$.pipe(
    withLatestFrom(this._errors$.pipe(
      map((errorObject) => {
        return errorObject && Object.keys(errorObject)
          .filter(key => key !== 'required')
          .reduce((obj, key) => {
            obj[key] = errorObject[key];
            return obj;
          }, {});
      }))),
    map(([valid, errors]) => {
      return valid
        ? null
        : (errors && Object.keys(errors).length ? errors : null);
    }),
  );
  error$ = this.errors$.pipe(map(errors => {
    return errors ? Object.keys(errors).find(() => true) : null
  }));
  hasRequiredError$ = new BehaviorSubject(false);
  shake$ = new BehaviorSubject(false);

  constructor(
    formState?: any,
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ) {
    super(formState, {
      validators,
      asyncValidators,
      updateOn: 'change',
    } as AbstractControlOptions);

    this._errors$.pipe(
      map(errors => errors ? Object.keys(errors).includes('required') : false),
    ).subscribe(this.hasRequiredError$);

    this._errors$.next(this.errors);
    this.statusChanges.subscribe((status: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED') => {
      this._errors$.next(this.errors);
    });
  }

}
