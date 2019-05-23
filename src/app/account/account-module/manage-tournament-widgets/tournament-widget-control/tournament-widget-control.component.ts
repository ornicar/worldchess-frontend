import { Component, OnInit, OnDestroy, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { SubscriptionHelper, Subscriptions } from '../../../../shared/helpers/subscription.helper';
import { ITournamentWidget } from '../../../../broadcast/core/tournament/tournament-widgets.service';
import { ITour } from '../../../../broadcast/core/tour/tour.model';


function widgetGroupValidator(formPartner: FormGroup) {
  // const err = {
  //   incorrectPartner: 'Please select all fields'
  // };
  // const widget = formPartner.getRawValue() as Partial<ITournamentWidget>;

  // return (!widget.id === !widget.tour) ? null : err;
  return null;
}

@Component({
  selector: 'wc-tournament-widget-control',
  templateUrl: './tournament-widget-control.component.html',
  styleUrls: ['./tournament-widget-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TournamentWidgetControlComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TournamentWidgetControlComponent),
      multi: true
    }
  ]
})
export class TournamentWidgetControlComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() tours: ITour[] = [];

  widgetForm: FormGroup;
  private subs: Subscriptions = {};

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.widgetForm = this.fb.group({
      id: [null],
      tour: [null, [Validators.required]],
    }, [widgetGroupValidator]);

    this.subs.formChange = this.widgetForm.valueChanges
      .subscribe(v => this.propagateChange(v));
  }

  validate(c: FormControl) {
    return (this.widgetForm && this.widgetForm.invalid) ? this.widgetForm.errors : null;
  }

  writeValue(value: ITournamentWidget) {
    let nextValue;
    if (!!value) {
      nextValue = {
        id: value.id,
        tour: value.tour,
      };
    } else {
      nextValue = {
        id: null,
        tour: null,
      };
    }

    this.widgetForm.patchValue(nextValue);
  }

  propagateChange = (_: any) => {
  };
  propagateTouched = (_: any) => {
  };

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn) {
    this.propagateTouched = fn;
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.widgetForm.controls['tour'].disable();
    } else {
      this.widgetForm.controls['tour'].enable();
    }
  }
}
