import { FormGroup, ValidationErrors } from '@angular/forms';


export interface ControlValidationError {
  [key: string]: ValidationErrors;
}

export class FormHelper {
  public static mapErrorsToFormGroup(form: FormGroup, errors: ControlValidationError) {
    Object.keys(form.controls)
      .forEach((ctrlName) => {
        if (errors[ctrlName]) {
          form.get(ctrlName).setErrors(errors[ctrlName]);
        }
      });
  }

  public static mapResponseError(errors: {[key: string]: string}): ControlValidationError {
    const out: ControlValidationError = {};
    Object.keys(errors)
      .forEach(field => {
        out[field] = {responseError: errors[field]};
      });
    return out;
  }
}
