import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core';
import {IMove} from '../../move.model';

@Component({
  selector: 'wc-move',
  templateUrl: './move.component.html',
  styleUrls: ['./move.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveComponent implements OnInit {

  @Input() move: IMove;

  @Input()
  @HostBinding('class.select')
  selected = false;

  @Input()
  @HostBinding('class.completed')
  completed = false;

  get isWhite() {
    return this.move.is_white_move;
  }

  constructor() { }

  ngOnInit() {}

  get isCastling(): boolean {
    return this.move.san === 'O-O' || this.move.san === 'O-O-O';
  }
}
