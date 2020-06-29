import { AbstractControlOptions, AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';
import { PaygateFormControl } from '@app/modules/paygate/_shared/paygate-form-control.class';
import { combineLatest, Subject } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';

export class PaygateForm extends FormGroup {

  controls: {
    [key: string]: PaygateFormControl;
  };

  private _submit$ = new Subject();
  submit$ = this._submit$.pipe(
    withLatestFrom(this.statusChanges),
    map(([_, status]) => status),
    filter(status => status === 'VALID'),
  );

  hasRequiredErrors$ = combineLatest(
    this.controlsArray.map((c: PaygateFormControl) => c.hasRequiredError$),
  ).pipe(
    map((errors) => errors.includes(true)),
  );

  input$ = combineLatest(
    this.controlsArray.map((c: PaygateFormControl) => c.input$),
  ).pipe(
    map((inputs) => inputs.includes(true)),
  );

  valid$ = combineLatest(
    this.statusChanges,
    this.input$,
    combineLatest(this.controlsArray.map(c => c.empty$)),
  ).pipe(
    map(([status, input, empties]) => {
      if (input) {
        return true;
      }
      if (empties.includes(true)) {
        return true;
      }
      return this.pristine ? true : this.status === 'VALID';
    }),
  );

  invalid$ = this.valid$.pipe(map(valid => !valid));

  shake$ = this._submit$.pipe(
    withLatestFrom(this.hasRequiredErrors$),
    map(([_, hasRequiredErrors]) => !!hasRequiredErrors),
  );

  constructor(
    controls: { [key: string]: PaygateFormControl },
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ) {
    super(controls, {
      validators,
      asyncValidators,
      updateOn: 'blur',
    } as AbstractControlOptions);

    this.shake$.pipe(
      filter(sh => !!sh)
    ).subscribe(() => {
      const control = this.controlsArray.find(c => c.hasError('required'));
      control.shake$.next(true);
    });
  }

  get controlsArray(): PaygateFormControl[] {
    return Object.values(this.controls as {[k: string]: PaygateFormControl});
  }

  submit() {
    this.updateValueAndValidity();
    this._submit$.next();
  }
}
