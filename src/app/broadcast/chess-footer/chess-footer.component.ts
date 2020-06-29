import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ElementRef, OnChanges } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { OnChangesInputObservable, OnChangesObservable } from '@app/shared/decorators/observable-input';
import { Tournament, TournamentResourceType, TournamentType } from '../core/tournament/tournament.model';
import { ScreenStateService } from '@app/shared/screen/screen-state.service';
import { IBoard } from '@app/broadcast/core/board/board.model';

@Component({
  selector: 'wc-chess-footer',
  templateUrl: './chess-footer.component.html',
  styleUrls: ['./chess-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessFooterComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  public tournament = null;

  @OnChangesInputObservable('tournament')
  public tournament$ = new BehaviorSubject<Tournament>(this.tournament);

  @Input()
  public tour = null;

  @Input()
  public board: IBoard;

  public subs = [];

  public tabs: { title: string, value: string }[] = [];
  public activeTab = 'information';
  private isMobile: boolean;

  constructor(
    private cd: ChangeDetectorRef,
    private el: ElementRef,
    private screenService: ScreenStateService,
  ) {
    this.screenService.matchMediaMobile$.subscribe(isMobile => this.isMobile = isMobile);
  }

  ngOnInit() {
    this.tabs = [];
    this.addTab('information');
    this.addTab('news');
    this.addTab('media');

    this.subs.push(this.tournament$.subscribe(tournament => {
      if (tournament) {
        if (tournament.resourcetype === TournamentResourceType.OnlineTournament) {
          this.addTab('players');
        } else {
          this.tabs = this.tabs.filter((tab) => tab.value !== 'players');
        }

        if (
          tournament.resourcetype === TournamentResourceType.Tournament
          || tournament.resourcetype === TournamentResourceType.FounderTournament
        ) {
          this.addTab('results');
        } else {
          this.tabs = this.tabs.filter((tab) => tab.value !== 'results');
        }
      }

      if (!this.tabs.map(t => t.value).includes(this.activeTab)) {
        this.setDefaultActiveTab();
      }

      if (!this.activeTab) {
        this.setDefaultActiveTab();
      }

      this.cd.markForCheck();
    }));
  }

  @OnChangesObservable()
  ngOnChanges() {}

  private addTab(tabName: string): void {
    const isTabExist = Boolean(this.tabs.find(tab => tab.value === tabName));

    if (!isTabExist) {
      this.tabs.push({
        title: tabName.charAt(0).toUpperCase() + tabName.slice(1),
        value: tabName
      });
    }
  }

  setDefaultActiveTab() {
    this.activeTab = this.tabs.length > 0 && this.tabs.find(() => true).value;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  public setActiveTab(tab: string) {
    if (tab === 'media') {
      const offset = this.el.nativeElement.offsetTop;
      window.scrollTo({ top: offset - 50 });
    }
    if (!this.tabs.map(t => t.value).includes(tab)) {
      this.setDefaultActiveTab();
    } else {
      this.activeTab = tab;
    }
    this.cd.markForCheck();
  }
}
