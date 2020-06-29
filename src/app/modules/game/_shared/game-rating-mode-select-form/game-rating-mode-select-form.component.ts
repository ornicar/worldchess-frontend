import { AccountService } from './../../../../account/account-store/account.service';
import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { GameRatingMode } from '@app/broadcast/core/tour/tour.model';

@Component({
  selector: 'wc-game-rating-mode-select-form',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GameRatingModeSelectFormComponent),
      multi: true
    }
  ],
  templateUrl: './game-rating-mode-select-form.component.html',
  styleUrls: ['./game-rating-mode-select-form.component.scss']
})
export class GameRatingModeSelectFormComponent implements ControlValueAccessor {

  UserRating = GameRatingMode;

  selectedUserRating: GameRatingMode;
  disabled = false;

  destroy$ = new Subject();

  constructor(
    public accountService: AccountService
  ) { }

  onSelectUserRating(value: GameRatingMode) {
    if (!this.disabled) {
      this.writeValue(value);
      switch (value) {
        case GameRatingMode.UNRATED:
          window['dataLayerPush']('wchPlay', 'Play', 'Non-rated', 'click', null, null);
          break;
        case GameRatingMode.RATED:
          window['dataLayerPush']('wchPlay', 'Play', 'Rated', 'click', null, null);
          break;
        case GameRatingMode.FIDERATED:
          window['dataLayerPush']('wchPlay', 'Play', 'FIDE Rated', 'click', null, null);
          break;
      }
    }
  }


  get value() {
    return this.selectedUserRating;
  }

  set value(val) {
    this.selectedUserRating = val;
    this.onChange(val);
    this.onTouched();
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value: GameRatingMode) {
    if (value) {
      this.value = value;
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
