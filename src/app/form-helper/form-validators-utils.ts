import {FormControl, ValidatorFn} from '@angular/forms';

export abstract class FormValidatorsUtils {

  private static readonly JUST_INVALID_MESSAGE = {
    invalidInput: {
      message: 'invalid'
    }
  };

  public static equalLengthValidator(minLength: number, maxLength?: number): ValidatorFn {
    if (!maxLength) {
      maxLength = minLength;
    }

    return formControl => formControl.value.length >= minLength && formControl.value.length <= maxLength
      ? null
      : this.JUST_INVALID_MESSAGE;
  }

  public static cardDateValidator(): ValidatorFn {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() - 2000;
    return formControl => {
      const dates = formControl.value.split(' / ').map(date => Number(date));
      if (dates.length !== 2 || (dates[1] < currentYear) || (dates[0] <= currentMonth && dates[1] === currentYear)) {
        return this.JUST_INVALID_MESSAGE;
      }
      return null;
    };
  }
}
