import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {IMove} from '../../../../../move/move.model';
import {ColliderService} from './collider.service';

@Component({
  selector: 'wc-moves-navigation-slider',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './moves-navigation-slider.component.html',
  styleUrls: ['./moves-navigation-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovesNavigationSliderComponent implements AfterContentChecked {
  @Input() moves: IMove[] = [];
  @Input() selectedMove: IMove = null;
  @Input() isLive = false;
  @Input() sliderWidth: number;

  @Output() sliderChanged = new EventEmitter();

  @ViewChild('livePosition', { read: ElementRef }) livePosition: ElementRef;

  get value() {
    return (this.moves || []).indexOf(this.selectedMove);
  }

  get max() {
    return Math.max(0, (this.moves || []).length - 1);
  }

  isShowLiveNumberTooltip = false;

  currentPositionFormatter = {
    to: (value: number): string => {
      const move = this.getMoveByValue(value);

      return move ? move.move_number.toString() : '';
    }
  };

  constructor(
    private elementRef: ElementRef,
    private colliderService: ColliderService) {
  }

  private getMoveByValue(value) {
    return this.moves[Math.round(value)];
  }

  private updateLiveNumberTooltipVisibility(): void {
    const liveNumberTooltip = this.elementRef.nativeElement.querySelector('.noUi-tooltip');

    if (liveNumberTooltip && this.livePosition) {
      const isOverlapped = this.colliderService.isOverlapped(this.livePosition.nativeElement, liveNumberTooltip);

      this.isShowLiveNumberTooltip = this.value !== this.max && !isOverlapped;
    }
  }

  onLiveClick() {
    // Select last move.
    this.onSliderChange(this.max);
  }

  onSliderChange(value): void {
    const move = this.getMoveByValue(value);

    if (move) {
      this.sliderChanged.emit(move);
    }
  }

  ngAfterContentChecked() {
    if (this.value !== this.max) {
      this.updateLiveNumberTooltipVisibility();
    }
  }
}
