import {
  AbortGame,
  RejectOpponentRequestLast,
  ResetQuickstartFlag,
  SetGameSettings,
  SetReplayNotification
} from './../../state/game.actions';
import { GameSettingsWindowsComponent } from '@app/modal-windows/game-settings-windows/game-settings-windows.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GameState, IOnlineRating, OpponentMode, StartType } from '../../state/game.state';
import { BehaviorSubject, combineLatest, Observable,  Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, take, takeUntil, takeWhile, withLatestFrom } from 'rxjs/operators';
import {
  ClearOnlineRequestStatus,
  RejectOpponentRequest,
  RequestOpponent,
  RestartGame,
  SetCancelInvite,
  SetNotification,
  SetOpponentMode,
  SetSelectedRatingMode,
  SetSelectedTimeControl,
  SetSelectedTimeControlRatingMode
} from '../../state/game.actions';
import { GameRatingMode, ITimeControl } from '@app/broadcast/core/tour/tour.model';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaygatePopupService } from '@app/modules/paygate/services/paygate-popup.service';
import { select, Store as NgrxStore } from '@ngrx/store';
import { selectIsAuthorized } from '@app/auth/auth.reducer';
import { selectFideIdPlan } from '@app/purchases/subscriptions/subscriptions.reducer';
import * as fromRoot from '@app/reducers';
import { AccountVerification, IAccountRating, ISettingsGameAccount } from '@app/account/account-store/account.model';
import { selectAccount } from '@app/account/account-store/account.reducer';
import { GameSharedService } from '@app/modules/game/state/game.shared.service';
import { ModalWindowsService } from '@app/modal-windows/modal-windows.service';
import { environment } from '../../../../../environments/environment';
import { GamingSelectorMode } from '../../gaming-selector/gaming-selector.component';
import { TournamentGameState } from '@app/modules/game/tournaments/states/tournament.game.state';
import { AccountService } from '@app/account/account-store/account.service';

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

@Component({
  selector: 'game-launch-settings',
  templateUrl: 'launch-settings.component.html',
  styleUrls: ['launch-settings.component.scss']
})
export class GameLaunchSettingsComponent implements OnInit, OnDestroy {
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
  @Select(GameState.gameRatingMode) gameRatingMode$: Observable<GameRatingMode>;
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

  @Select(TournamentGameState.tournamentGameInProgressOrJustFinished)
  tournamentGameInProgressOrJustFinished$: Observable<boolean>;

  settingsForm = new FormGroup({
    timeControl: new FormControl(null),
    ratingMode: new FormControl(GameRatingMode.UNRATED),
    ratingRange: new FormControl()
  });

  window = window;

  gameURL = environment['gameUrl'];
  inviteCode = '';

  playComputerIsSearching$ = new BehaviorSubject(false);
  submitButtonMode = SubmitButtonMode.FIND_OPPONENT;
  SubmitButtonMode = SubmitButtonMode;
  GameRatingMode = GameRatingMode;
  GamingSelectorMode = GamingSelectorMode;

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

  private _oppmode: OpponentMode;

  routeBoardId$ = this.route.params.pipe(
    map(params => (params && params['board_id']) ? params['board_id'] : null),
  );

  constructor(
    private store: Store,
    private store$: NgrxStore<fromRoot.State>,
    private router: Router,
    private route: ActivatedRoute,
    private paygatePopupService: PaygatePopupService,
    private gameSharedService: GameSharedService,
    private modal: ModalWindowsService,
    private dialog: MatDialog,
    public accountService: AccountService,
  ) {
    this.isAuthorized$.pipe(
      filter((authorized) => !!authorized),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.store.dispatch(new RejectOpponentRequest());
    });
    this.getCancelInvite$.subscribe(data => {
      if (data) {
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
    combineLatest([
      this.settingsForm.valueChanges,
      this.isAuthorized$,
      this.fidePurchased$,
      this.fideIdStatus$,
      this.getCancelInvite$,
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
      this.getCancelInvite$,
      this.inviteCode$,
      this.routeBoardId$,
    ])
      .subscribe(([value, cancel, inviteCode, boardId]) => {
        if (!cancel && !inviteCode && !boardId) {
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
    /*this.gameRatingMode$.pipe(take(1)).subscribe(val => {
      console.log('->', val);
      this.settingsForm.patchValue({
        ratingMode: val
      });
    });*/
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
                  } else if (val === StartType.InviteFriend) {
                    this.inviteFriend();
                  } else if (val === StartType.CreateAccount) {
                    this.createAccount();
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

    if (!this.playComputerIsSearching$.value) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.store.dispatch(new SetOpponentMode(OpponentMode.HUMAN));
      this.gameReady$.pipe(take(1)).subscribe((ready) => {
        if (ready) {
          this.store.dispatch(new RestartGame());
        }
        this.settingsForm.disable();
        this.store.dispatch(new RequestOpponent());
        this.submitButtonMode = SubmitButtonMode.SEARCHING;
      });
      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Find opponent',
        this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
        this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
        this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
      );
    }
  }


  public inviteFriend(event?: Event): void {
    if (this.submitButtonMode !== SubmitButtonMode.SEARCHING && this.submitButtonMode !== SubmitButtonMode.CREATE_ACCOUNT) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.store.dispatch(new SetOpponentMode(OpponentMode.FRIEND));
      this.gameReady$.pipe(take(1)).subscribe((ready) => {
        if (ready) {
          this.store.dispatch(new RestartGame());
        }
        this.settingsForm.disable();
        this.store.dispatch(new RequestOpponent());
        this.submitButtonMode = SubmitButtonMode.INVITE_FRIEND;
      });
      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Invite a friend',
        this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
        this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
        this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
      );
    }
  }

  public stopSearching(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.gameReady$.pipe(take(1)).subscribe(() => {
      this.store.dispatch(new RejectOpponentRequest());
      this.settingsForm.enable();
      this.submitButtonMode = SubmitButtonMode.FIND_OPPONENT;
    });
    window['dataLayerPush'](
      'wchPlay',
      'Play',
      'Enough!',
      this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
      this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
      this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
    );
  }

  public setCancelInvite(event: Event): void {
    this.submitButtonMode = SubmitButtonMode.FIND_OPPONENT;
    this.store.dispatch(new SetNotification(''));
    if (this._oppmode === OpponentMode.BOT) {
      this.store.dispatch(new AbortGame());
    } else {
      this.store.dispatch(new SetCancelInvite(false));
    }
    this.stopSearching(event);
  }

  public cancelRematch(event: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.store.dispatch(new SetReplayNotification(null));
    this.store.dispatch(new SetNotification(''));
    this.settingsForm.enable();
    this.submitButtonMode = SubmitButtonMode.FIND_OPPONENT;
    this.lastOpponentMode$.pipe(
      take(1),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((opponent) => {
      if (opponent === OpponentMode.BOT) {
        this.store.dispatch(new AbortGame());
      } else {
        this.gameReady$.pipe(take(1)).subscribe(() => {
          this.store.dispatch(new RejectOpponentRequestLast());
        });
      }
    });
  }

  public createAccount(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    window['dataLayerPush'](
      'wchPlay',
      'Play',
      'Create account',
      this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
      this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
      this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
    );
    this.router.navigate(['', {outlets: {p: ['paygate', 'register']}}]);
  }

  public updateAccount(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.paygatePopupService.setState({fideSelected: true});
    this.paygatePopupService.stepLoaded$.next('payment');
    window['dataLayerPush'](
      'wchPlay',
      'Play',
      'Upgrade now',
      this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
      this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
      this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
    );
    this.router.navigate(['', {outlets: {p: ['paygate', 'payment']}}]);
  }

  public registerFideId(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.paygatePopupService.setState({fideSelected: true});
    this.router.navigate(['', {outlets: {p: ['paygate', 'fide']}}]);
  }

  public playComputer(event?: Event) {
    if (this.submitButtonMode !== SubmitButtonMode.SEARCHING) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.settingsForm.patchValue({
        ratingMode: GameRatingMode.UNRATED
      });
      this.store.dispatch(new SetSelectedTimeControlRatingMode(
        this.settingsForm.value['timeControl'],
        GameRatingMode.UNRATED
      ));
      this.store.dispatch(new SetOpponentMode(OpponentMode.BOT));
      this.gameReady$.pipe(take(1)).subscribe((ready) => {
        if (ready) {
          this.store.dispatch(new RestartGame());
        }
        this.playComputerIsSearching$.next(true);
        this.settingsForm.disable();
        this.store.dispatch(new RequestOpponent());
      });

      window['dataLayerPush'](
        'wchPlay',
        'Play',
        'Play computer',
        this.gameSharedService.convertBoardType(this.settingsForm.value['timeControl'].board_type),
        this.gameSharedService.convertTime(this.settingsForm.value['timeControl']),
        this.gameSharedService.convertGameMode(this.settingsForm.value['ratingMode'])
      );
    }
  }

  onCopyLink(event: Event) {
    try {
      const el = this.fieldInviteURL.nativeElement;
      el.select();
      const status = document.execCommand('copy');
      (event.target as any).focus();
      this.showCopied$.next(true);
    } catch (err) {
      console.error('Unable to copy');
    }
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
