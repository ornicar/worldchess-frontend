import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MoveReaction } from '../../move.model';

const iconClasses = {
  [MoveReaction.BLUNDER]: 'blunder',
  [MoveReaction.MISTAKE]: 'mistake',
  [MoveReaction.MAJOR_CHANGE_OF_SITUATION]: 'change',
  [MoveReaction.CHECK]: 'check',
  [MoveReaction.VERY_LONG_THINKING_TIME]: 'long-thinking',
  [MoveReaction.MATE_IN_GT_10]: 'mate-long',
  [MoveReaction.MATE_IN_LS_10]: 'mate-fast'
};

@Component({
  selector: 'wc-move-icon',
  templateUrl: './move-icon.component.html',
  styleUrls: ['./move-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveIconComponent {
  @Input() reaction: string;

  get iconClass(): string {
    return iconClasses[this.reaction] || '';
  }
}
