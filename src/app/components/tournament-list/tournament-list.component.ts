import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Tournament, TournamentResourceType, TournamentStatus } from '../../broadcast/core/tournament/tournament.model';


@Component({
  selector: 'wc-tournament-list',
  templateUrl: 'tournament-list.component.html',
  styleUrls: ['tournament-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TournamentListComponent {
  @ContentChild('title', { read: TemplateRef }) title: TemplateRef<HTMLElement>;
  @ContentChild('buttons', { read: TemplateRef }) buttons: TemplateRef<HTMLElement>;
  @Input() tournaments: Tournament[];
  @Input() isDisplayShowMoreBtn: boolean;
  @Output() clickShowMore = new EventEmitter();
  @Output() clickItem: EventEmitter<Tournament> = new EventEmitter();
  @ViewChild('list')
  tournamentsListEl: ElementRef;

  readonly TOURNAMENT_ITEM_HEIGHT = 378;
  readonly TOURNAMENT_ITEM_WIDTH = 270;
  readonly TOURNAMENT_ITEM_WIDTH_PADDING = 20;

  private _inTheEndOfScroll = false;
  public get inTheEndOfScroll(): boolean {
    return this._inTheEndOfScroll;
  }

  onShowMore() {
    this.clickShowMore.emit();
  }

  trackByFn(tournament: Tournament): number {
    return tournament.id;
  }

  onClickItem(tournament: Tournament) {
    this.clickItem.emit(tournament);
  }

  private getScrollbarSize(): number {
    const element: HTMLElement = this.tournamentsListEl.nativeElement;
    return element.scrollHeight - element.offsetHeight;
  }

  private setScollbarPosition(yPos: number): void {
    const element: HTMLElement = this.tournamentsListEl.nativeElement;
    element.scroll(0, yPos);
  }

  public getCountInLine(): number {
    const element: HTMLElement = this.tournamentsListEl.nativeElement;
    return Math.trunc((element.offsetWidth - this.TOURNAMENT_ITEM_WIDTH_PADDING) / this.TOURNAMENT_ITEM_WIDTH);
  }

  public scrollDown(): void {
    setTimeout(() => this.setScollbarPosition(this.getScrollbarSize()), 200);
  }
}
