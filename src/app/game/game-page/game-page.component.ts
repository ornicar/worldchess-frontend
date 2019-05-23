import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { GameState } from '../state/game.state';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IGameMove } from '../state/game-move.model';
import { Draw, Resign, SelectMove, SendBugReport, GetTimeControls, SetSelectedTimeControl, AbortGame } from '../state/game.actions';
import { filter, takeUntil, combineLatest, withLatestFrom, map } from 'rxjs/operators';
import { GameResult } from '../state/game-result-enum';
import { ModalWindowsService } from '../../../app/modal-windows/modal-windows.service';
import { ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { IAccount } from '@app/account/account-store/account.model';

@Component({
  selector: 'game-page',
  templateUrl: 'game-page.component.html',
  styleUrls: ['game-page.component.scss']
})
export class GamePageComponent implements OnInit, OnDestroy {
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.gameResult) gameResult$: Observable<GameResult>;
  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;
  @Select(GameState.moves) moves$: Observable<IGameMove[]>;
  @Select(GameState.selectedMove) selectedMove$: Observable<IGameMove>;
  @Select(GameState.notification) notification$: Observable<string>;
  @Select(GameState.opponentOfferedDraw) opponentOfferedDraw$: Observable<boolean>;
  @Select(GameState.gameInProgress) gameInProgress$: Observable<boolean>;
  @Select(GameState.socketMessages) socketMessages$: Observable<any[]>;
  @Select(GameState.timeControls) timeControls$: Observable<ITimeControl[]>;
  @Select(GameState.selectedTimeControl) selectedTimeControl$: Observable<ITimeControl>;
  @Select(GameState.account) account$: Observable<IAccount>;

  _showResign = new BehaviorSubject(false);
  showResign$ = this._showResign.asObservable();

  _showDraw = new BehaviorSubject(false);
  showDraw$ = this._showDraw.asObservable();

  _abortGame = new BehaviorSubject(false);
  abortGame$ = this._abortGame.asObservable();
  canAbortGame$: Observable<boolean> = this.moves$.pipe(
    map(movies => !movies || movies.length < 2),
  );

  destroy$ = new Subject();

  public showMainNav = true; // TODO дикий костыль ваще
  public _isMobilePanelShown = new BehaviorSubject(false);
  public isMobilePanelShown$ = this._isMobilePanelShown.asObservable().pipe(
      combineLatest(this.showDraw$, this.showResign$, this.abortGame$),
      map(([showPanel, showDraw, showResign, abortGame]) => showPanel && !(showDraw || showResign || abortGame))
  );

  bgColors = {
    incoming: 'lightsalmon',
    outcoming: 'mediumseagreen',
    status: '#97CDFF',
  };

  private readonly _initialTabs = [
    {
      id: 'start',
      name: 'New game',
      disabled: false,
    },
    {
      id: 'notations',
      name: 'Current game',
      disabled: false,
    },
    {
      id: null,
      name: 'Tournament',
      icon: 'tournaments-and-games',
      comingSoon: true,
      disabled: true,
    },
    {
      id: null,
      name: 'Chat',
      icon: 'chat',
      comingSoon: true,
      disabled: true,
    },
  ];
  _tabs = new BehaviorSubject(this._initialTabs);
  tabs$ = this._tabs.asObservable();

  _activeTab = new BehaviorSubject(this._initialTabs[0]);
  activeTab$ = this._activeTab.asObservable();

  gameInProgress = new BehaviorSubject(false);

  constructor(
    private store: Store,
    private modalService: ModalWindowsService,
  ) {
    this.opponentOfferedDraw$.pipe(
      takeUntil(this.destroy$),
    ).subscribe((offer) => {
      if (offer) {
        this._showDraw.next(true);
      }
    });
  }

  ngOnInit() {
    this.gameInProgress$.pipe(takeUntil(this.destroy$)).subscribe(v => this.gameInProgress.next(v));

    this.gameReady$
        .pipe(
          takeUntil(this.destroy$),
          filter(ready => !!ready),
        )
        .subscribe(() => {
          this.clickOnTab(this._initialTabs[1]);
        });
    this.waitingOpponent$
        .pipe(
          takeUntil(this.destroy$),
          filter(v => !!v),
        )
        .subscribe(() => {
          this.clickOnTab(this._initialTabs[0]);
        });

    this.activeTab$.pipe(takeUntil(this.destroy$)).subscribe((activeTab) => {
      this._tabs.next(
        [activeTab].concat(this._initialTabs.filter(t => t.id !== activeTab.id))
      );
    });

    this.store.dispatch(new GetTimeControls());

    this.account$.subscribe((account) => {
      const newGameTab = this._initialTabs.find(tab => tab.id === 'start');
      this._activeTab.next(newGameTab);
    });
  }

  onBeforeUnloadEvent = (e: BeforeUnloadEvent) => {
    e.returnValue = this.gameInProgress.value;
  }

  ngOnDestroy() {
    // window.removeEventListener('beforeunload', this.onBeforeUnloadEvent);
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  clickOnTab(tab) {
    if (!tab.disabled) {
      this._activeTab.next(tab);
    }
  }

  onSelectHistoryMove(move: IGameMove): void {
    this.store.dispatch(new SelectMove(move));
  }

  resign() {
    this._showResign.next(false);
    this.store.dispatch(new Resign());
  }

  draw() {
    this._showDraw.next(false);
    this.store.dispatch(new Draw());
  }

  public toggleMobilePanel(): void {
    this._isMobilePanelShown.next(!this._isMobilePanelShown.value);
  }

  public declineDraw(): void {
    this._showDraw.next(false);
    this._isMobilePanelShown.next(false);
  }

  public declineResign(): void {
    this._showResign.next(false);
    this._isMobilePanelShown.next(false);
  }

  public declineAbort(): void {
    this._abortGame.next(false);
    this._isMobilePanelShown.next(false);
  }

  public showBugReportWindow(): void {
    this.modalService.bugReport().pipe(
      filter(report => Boolean(report))
    ).subscribe((report) => {
      this.store.dispatch(new SendBugReport(report));
      this.modalService.alert('Bug report', `
        <p>Your report about problem has been sent.</p>
        <p>Thank you!</p>
      `);
    });
  }

  public selectTimeControl(timeControl: ITimeControl): void {
    this.store.dispatch(new SetSelectedTimeControl(timeControl));
  }

  public abortGame(): void {
    this._abortGame.next(false);
    this.store.dispatch(new AbortGame());
  }
}
