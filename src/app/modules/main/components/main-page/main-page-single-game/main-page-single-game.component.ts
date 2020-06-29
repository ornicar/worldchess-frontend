import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Select, Store} from "@ngxs/store";
import {GameState, IOnlineRating, OpponentMode, StartType} from "@app/modules/game/state/game.state";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {ITimeControl} from "@app/broadcast/core/tour/tour.model";
import {AccountVerification, IAccountRating, ISettingsGameAccount} from "@app/account/account-store/account.model";
import {FormControl, FormGroup} from "@angular/forms";
import {environment} from "../../../../../../environments/environment";
import {select, Store as NgrxStore} from "@ngrx/store";
import {selectIsAuthorized} from "@app/auth/auth.reducer";
import {selectFideIdPlan} from "@app/purchases/subscriptions/subscriptions.reducer";
import {distinctUntilChanged, filter, map, take, takeUntil, takeWhile, withLatestFrom} from "rxjs/operators";
import {selectAccount} from "@app/account/account-store/account.reducer";
import * as fromRoot from "@app/reducers";
import {Router} from "@angular/router";
import {PaygatePopupService} from "@app/modules/paygate/services/paygate-popup.service";
import {GameSharedService} from "@app/modules/game/state/game.shared.service";
import {ModalWindowsService} from "@app/modal-windows/modal-windows.service";
import {MatDialog} from "@angular/material";
import {
  AbortGame,
  ClearOnlineRequestStatus, GetTimeControls, RejectOpponentRequestLast,
  RequestOpponent,
  ResetQuickstartFlag,
  RestartGame, SetGameSettings,
  SetNotification,
  SetOpponentMode, SetQuickstartFlag, SetReplayNotification,
  SetSelectedRatingMode,
  SetSelectedTimeControl, SetSelectedTimeControlRatingMode
} from "@app/modules/game/state/game.actions";
import {GameSettingsWindowsComponent} from "@app/modal-windows/game-settings-windows/game-settings-windows.component";

enum SubmitButtonMode {
  FIND_OPPONENT,
  CREATE_ACCOUNT,
  UPGRADE_NOW,
  NEED_FIDE_ID_REGISTER,
  NEED_FIDE_ID_APPROVE,
  SEARCHING,
  INVITE_FRIEND,
  CANCEL_INVITE,
}

export enum GameRatingMode {
  UNRATED = 'non-rated',
  RATED = 'worldchess',
  FIDERATED = 'fide'
}

export enum GamingSelectorMode {
  MainPage,
  SingleGames,
  Tournaments
}

@Component({
  selector: 'main-page-single-game',
  templateUrl: './main-page-single-game.component.html',
  styleUrls: ['./main-page-single-game.component.scss']
})
export class MainPageSingleGameComponent implements OnInit {

  @Select(GameState.waitingOpponent) waitingOpponent$: Observable<boolean>;
  @Select(GameState.onlineRequestFailed) onlineRequestFailed$: Observable<boolean>;
  @Select(GameState.gameReady) gameReady$: Observable<boolean>;
  @Select(GameState.timeControls) timeControls$: Observable<ITimeControl[]>;
  @Select(GameState.selectedTimeControl) timeControl$: Observable<ITimeControl>;
  @Select(GameState.accountRating) accountRating$: Observable<IAccountRating>;
  @Select(GameState.onlineRatings) onlineRatings$: Observable<IOnlineRating[]>;
  @Select(GameState.notification) notification$: Observable<string>;
  @Select(GameState.getIsReplay) getIsReplay$: Observable<boolean>;
  @Select(GameState.lastOpponentMode) lastOpponentMode$: Observable<OpponentMode>;
  /**
   * Get game settings;
   */
  @Select(GameState.getGameSettings) gameSettings$: Observable<ISettingsGameAccount>;
  /**
   * invite code
   */
  @Select(GameState.getInviteCode) inviteCode$: Observable<string>;
  @Select(GameState.getCancelInvite) getCancelInvite$: Observable<boolean>;
  /**
   * replay
   */
  @Select(GameState.getReplayNotification) getReplayNotification$: Observable<string>;
  /**
   * rematch
   */
  @Select(GameState.getRematchNotification) getRematchNotification$: Observable<string>;
  @Select(GameState.getIsRematch) getIsRematch$: Observable<boolean>;
  @Select(GameState.getQuickStart) getQuickStart$: Observable<StartType>;

  @Input() full: boolean = false

  settingsForm = new FormGroup({
    timeControl: new FormControl(null),
    ratingMode: new FormControl(GameRatingMode.UNRATED),
    ratingRange: new FormControl()
  });

  window = window;

  inviteCode = '';

  playComputerIsSearching$ = new BehaviorSubject(false);
  submitButtonMode = SubmitButtonMode.FIND_OPPONENT;
  SubmitButtonMode = SubmitButtonMode;
  GameRatingMode = GameRatingMode;

  ready = false;
  disabled$: Subject<boolean> = new BehaviorSubject(true);
  isAuthorized$ = this.store$.pipe(
    select(selectIsAuthorized),
  );

  fidePurchased$: Observable<boolean> = this.store$.pipe(
    select(selectFideIdPlan),
    map((fidePlan) => {
      return fidePlan && fidePlan.is_active;
    })
  );

  fideIdStatus$: Observable<AccountVerification> = this.store$.pipe(
    select(selectAccount),
    map((account) => {
      if (account && account.account) {
        return account.account.fide_verified_status;
      }

      return AccountVerification.NOT_VERIFIED;
    })
  );

  showCopied$ = new BehaviorSubject(false);

  destroy$ = new Subject();
  gameSettings: ISettingsGameAccount;

  @ViewChild('fieldInviteURL', {static: false}) fieldInviteURL: ElementRef<any>;

  constructor(
    private store: Store,
    private store$: NgrxStore<fromRoot.State>,
    private router: Router,
    private paygatePopupService: PaygatePopupService,
    private gameSharedService: GameSharedService,
    private modal: ModalWindowsService,
    private dialog: MatDialog,
  ) {
    this.getCancelInvite$.subscribe(data => {
      if (data) {
        var SubmitButtonMode;
        this.submitButtonMode = SubmitButtonMode.CANCEL_INVITE;
      }
    });

    this.inviteCode$.subscribe(data => {
      if (data) {
        this.inviteCode = data;
      } else {
        this.submitButtonMode = SubmitButtonMode.FIND_OPPONENT;
        this.settingsForm.enable();
      }
    });

    this.gameSettings$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((settings) => this.gameSettings = settings);
  }

  ngOnInit(): void {
    this.store.dispatch(new GetTimeControls());
    combineLatest([
      this.settingsForm.valueChanges,
      this.isAuthorized$,
      this.fidePurchased$,
      this.fideIdStatus$,
      this.getCancelInvite$
    ]).pipe(
      takeUntil(this.destroy$),
    ).subscribe(([value, isAuthorized, fidePurchased, fideIdStatus, cancelInvite]) => {
      if (!cancelInvite) {
        this.submitButtonMode = SubmitButtonMode.FIND_OPPONENT;
        if (value && value.ratingMode === GameRatingMode.RATED && !isAuthorized) {
          this.submitButtonMode = SubmitButtonMode.CREATE_ACCOUNT;
        } else if (value && value.ratingMode === GameRatingMode.FIDERATED) {
          if (isAuthorized) {
            if (!fidePurchased) {
              this.submitButtonMode = SubmitButtonMode.UPGRADE_NOW;
            } else {
              if (!fideIdStatus) {
                this.submitButtonMode = SubmitButtonMode.NEED_FIDE_ID_REGISTER;
              } else if (fideIdStatus === AccountVerification.ON_CHECK) {
                this.submitButtonMode = SubmitButtonMode.NEED_FIDE_ID_APPROVE;
              }
            }
          } else {
            this.submitButtonMode = SubmitButtonMode.CREATE_ACCOUNT;
          }
        }
      }
    });

    this.timeControl$.pipe(
      filter((timecontrol) => !!timecontrol),
      take(1)
    ).subscribe((timecontrol) => {
      this.settingsForm.patchValue({
        timeControl: timecontrol
      });
    });

    combineLatest([
      this.settingsForm.controls['timeControl'].valueChanges.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged()
      ),
      this.getCancelInvite$
    ])
      .subscribe(([value, cancel]) => {
        if (!cancel) {
          this.store.dispatch(new SetSelectedTimeControl(value));
        }
      });
    combineLatest([
      this.settingsForm.controls['ratingMode'].valueChanges.pipe(
        takeUntil(this.destroy$)
      ),
      this.getReplayNotification$,
    ]).pipe(
      withLatestFrom(this.getIsRematch$, this.inviteCode$),
      takeUntil(this.destroy$),
      distinctUntilChanged(),
    ).subscribe(([some, rematch, inviteCode]) => {
      const [ratingMode, _] = some;
      if (!rematch && !inviteCode) {
        this.store.dispatch(new SetSelectedRatingMode(ratingMode));
      }
    });

    this.onlineRequestFailed$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((onlineRequestFailed) => {
      if (onlineRequestFailed) {
        this.playComputerIsSearching$.next(false);
        this.submitButtonMode = SubmitButtonMode.FIND_OPPONENT;
        this.modal.alert('', `We couldn't connect you with the opponent. It's rare but it happens. Please search again!`);
        this.settingsForm.enable();
        this.store.dispatch(new ClearOnlineRequestStatus());
      }
    });

    this.getQuickStart$.pipe(take(1)).subscribe(val => {
      if (val) {
        this.store.dispatch(new ResetQuickstartFlag())
          .subscribe(_ => {
              this.onlineRatings$.pipe(
                takeWhile(__ => !this.ready)
              ).subscribe(v => {
                this.ready = !!v && v.length > 0;
                if (this.ready) {
                  this.disabled$.next(false);
                  if (val === StartType.Quickstart) {
                    this.findOpponent();
                  } else if (val === StartType.Computer) {
                    this.playComputer();
                  }
                }
              });
            }
          );
      } else {
        this.disabled$.next(false);
      }
    });
  }

  public findOpponent(event?: Event): void {
    this.store.dispatch(new SetQuickstartFlag(StartType.Quickstart)).subscribe(
      val => {
        this.router.navigate(["arena/singlegames"])
      }
    )
  }

  public createAccount(event?: Event): void {
    this.store.dispatch(new SetQuickstartFlag(StartType.CreateAccount)).subscribe(val =>
      this.store.dispatch(new SetSelectedRatingMode(this.settingsForm.value['ratingMode'])).subscribe(
        val => {
          this.router.navigate(["arena/singlegames"])
        }
      )
    )
  }


  public inviteFriend(event: Event): void {
    this.store.dispatch(new SetQuickstartFlag(StartType.InviteFriend)).subscribe(
      val => {
        this.router.navigate(["arena/singlegames"])
      }
    )
  }

  public playComputer(event?: Event) {
    this.store.dispatch(new SetQuickstartFlag(StartType.Computer)).subscribe(
      val => {
        this.router.navigate(["arena/singlegames"])
      }
    );
  }


  disabledSearch(button: SubmitButtonMode): boolean {
    return ([SubmitButtonMode.SEARCHING, SubmitButtonMode.INVITE_FRIEND, SubmitButtonMode.CANCEL_INVITE].includes(button));
  }

  disabledInvited(button: SubmitButtonMode): boolean {
    return ([
      SubmitButtonMode.SEARCHING,
      SubmitButtonMode.CREATE_ACCOUNT,
      SubmitButtonMode.INVITE_FRIEND,
      SubmitButtonMode.CANCEL_INVITE].includes(button));
  }

  hideNotification() {
    this.store.dispatch(new SetNotification(''));
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  settings() {
    // TODO: нужно будет создать универсальный классы с методами для проверки значений
    const checkResults = function (source) {
      return !!(source['board_last_move_style']
        && source['board_style']
        && source['board_legal_move_style']);
    };
    return this.dialog.open(GameSettingsWindowsComponent, {
      panelClass: 'game-settings-player',
      disableClose: true,
      data: this.gameSettings
    }).afterClosed()
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe((result) => {
        if (checkResults(result)) {
          this.store.dispatch(new SetGameSettings(
            result['board_style'],
            result['board_last_move_style'],
            result['board_legal_move_style'],
            result['is_sound_enabled']
          ));
        }
      });
  }
}
