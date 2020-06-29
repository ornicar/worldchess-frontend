import { AccountService } from './../../../../account/account-store/account.service';
import { Component, forwardRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import {
  BoardType,
  ITimeControl,
  ITimeControlGrouped,
  ITimeControlTypeGroup,
  ITimeControlWithBorderBottom
} from '@app/broadcast/core/tour/tour.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';

@Component({
  selector: 'wc-time-control-form',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeControlFormComponent),
      multi: true
    }
  ],
  templateUrl: './time-control-form.component.html',
  styleUrls: ['./time-control-form.component.scss']
})
export class TimeControlFormComponent implements OnInit, OnChanges, ControlValueAccessor, OnDestroy {

  @Input()
  timeControls: ITimeControl[];

  timeControls$ = new BehaviorSubject<ITimeControl[]>(this.timeControls);

  boardType = BoardType;
  moment = moment;

  durationFormat: moment.DurationFormatSettings = {
    trim: 'both',
    trunc: true,
    usePlural: false,
    useSignificantDigits: true
  };

  timeControlsByType: ITimeControlTypeGroup;
  timeControlGrouped: ITimeControlGrouped[] = [];

  selectedTimeControl: ITimeControl;
  selectedBoardType: BoardType;
  disabled = false;

  destroy$ = new Subject();

  constructor(
    private gameSharedService: GameSharedService,
    private accountService: AccountService,
  ) { }

  ngOnInit() {
    this.timeControls$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((timecontrols: ITimeControl[]) => {
      if (!timecontrols) {
        return;
      }

      this.timeControlsByType = timecontrols
        .slice()
        .map((timecontrol) => {
          return {
            ...timecontrol,
            incrementAsNumber: moment.duration(timecontrol.increment).asSeconds(),
            startTimeAsNumber: moment.duration(timecontrol.start_time).asSeconds()
          };
        })
        .sort((a: any, b: any) => {
          if (a.board_type > b.board_type) {
            return 1;
          }

          if (a.board_type === b.board_type) {
            if (a.incrementAsNumber && !(b.incrementAsNumber)) {
              return 1;
            }
            if (!(a.incrementAsNumber) && b.incrementAsNumber) {
              return -1;
            }

            if (a.startTimeAsNumber > b.startTimeAsNumber) {
              return 1;
            }

            if (a.startTimeAsNumber === b.startTimeAsNumber) {
              if (a.incrementAsNumber > b.incrementAsNumber) {
                return 1;
              }

              return -1;
            }
          }

          return -1;
        })
        .map((timecontrol) => {
          delete timecontrol.startTimeAsNumber;
          delete timecontrol.incrementAsNumber;

          return timecontrol;
        })
        .reduce((accum: ITimeControlTypeGroup, timecontrol: ITimeControl) => {
          if (accum[timecontrol.board_type] && accum[timecontrol.board_type].length) {
            accum[timecontrol.board_type].push(timecontrol);
          } else {
            accum[timecontrol.board_type] = [timecontrol];
          }

          return accum;
        }, {});

      this.timeControlGrouped = [];

      let lastLength = 0;
      Object.keys(this.timeControlsByType).forEach((key: string) => {
        this.timeControlGrouped.push({
          board_type: Number(key) as BoardType,
          timeControls: this.timeControlsByType[key].map((timecontrol) => ({ timecontrol, needBorderBottom: false })),
          topRounded: this.timeControlsByType[key].length > lastLength,
          bottomRounded: false
        });
        lastLength = this.timeControlsByType[key].length;
      });

      lastLength = 0;
      this.timeControlGrouped.reverse().forEach((timeControlGroup) => {
        timeControlGroup.bottomRounded = timeControlGroup.timeControls.length > lastLength;
        timeControlGroup.timeControls.forEach((timeControlWithBorder, index) => {
          if (index < lastLength) {
            timeControlWithBorder.needBorderBottom = true;
          }
        });
        lastLength = timeControlGroup.timeControls.length;
      });

      this.timeControlGrouped.reverse();
    });
  }


  ngOnChanges(changes) {
    this.timeControls$.next(changes['timeControls'] && changes['timeControls'].currentValue);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onSelectTimeControl(value: ITimeControl) {
    if (!this.disabled) {
      this.writeValue(value);

      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Time control',
        this.gameSharedService.convertBoardType(value.board_type),
        this.gameSharedService.convertTime(value),
        null
      );
    }
  }

  get value() {
    return this.selectedTimeControl;
  }

  set value(val) {
    this.selectedTimeControl = val;
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

  writeValue(value: ITimeControl) {
    if (value) {
      let selectedTimeControl = {} as Partial<ITimeControlWithBorderBottom>;
      if (this.timeControlGrouped && this.timeControlGrouped.length) {
        selectedTimeControl = this.timeControlGrouped
          .find((timeControlGroup) => {
            return timeControlGroup.board_type === value.board_type;
          })
          .timeControls
          .find((timeControlWithBorder) => timeControlWithBorder.timecontrol.id === value.id);
      }
      this.value = selectedTimeControl.timecontrol;
      this.selectedBoardType = value.board_type;
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
