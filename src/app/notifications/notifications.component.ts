import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { filter, map, mapTo, shareReplay, switchMap } from 'rxjs/operators';
import * as fromRoot from '../reducers';
import { SubscriptionHelper, Subscriptions } from '../shared/helpers/subscription.helper';
import { MarkReadNotification } from './notifications.actions';
import { ISocketGamingBoardCreatedMessage } from '../auth/auth.model';
import { selectAllUnreadBoardCreatedNotifications } from './notifications.reducer';

@Component({
  selector: 'wc-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit, OnDestroy {
  public notification$ = this.store$
    .pipe(
      // Show only unread messages.
      select(selectAllUnreadBoardCreatedNotifications),
      // Get last notification.
      map(notifications => notifications.length > 0 ? notifications[notifications.length - 1] : null),
      shareReplay(1)
    );

  private subs: Subscriptions = {};

  constructor(
    private cd: ChangeDetectorRef,
    private store$: Store<fromRoot.State>,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.subs.timer = this.notification$
      .pipe(
        filter(notification => Boolean(notification)),
        switchMap(notification => {
            const data = notification.data as ISocketGamingBoardCreatedMessage;
            const duration = moment(data.tour_start).diff(moment());

            // @todo move to notifications.effects.ts
            return timer(duration > 0 ? duration : 0).pipe(mapTo(new MarkReadNotification({id: notification.id})));
          }
        )
      )
      .subscribe(action => this.store$.dispatch(action));
  }

  public onClickNotification(e: Event, notification) {
    e.preventDefault();

    this.store$.dispatch(new MarkReadNotification({id: notification.id}));

    this.router
      .navigate(['/gaming', 'tournament', notification.data.tournament_id, 'game', notification.data.board_id, 'play']);
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
