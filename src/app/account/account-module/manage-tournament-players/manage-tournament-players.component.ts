import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { switchMap, tap} from 'rxjs/operators';
import { of } from 'rxjs';
import * as fromRoot from '../../../reducers';
import { SubscriptionHelper } from '../../../shared/helpers/subscription.helper';
import { TournamentLoadService } from '../../../broadcast/core/tournament/tournament-load.service';
import { ManageTournamentTab, TabValue } from '../manage-tournament/manage-tournament';
import { TournamentResourceService } from '../../../broadcast/core/tournament/tournament-resource.service';


@Component({
  selector: 'wc-manage-tournament-players',
  templateUrl: './manage-tournament-players.component.html',
  styleUrls: ['./manage-tournament-players.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageTournamentPlayersComponent extends ManageTournamentTab implements OnInit, OnDestroy {
  selectedTabValue: TabValue = 'players';

  public form: FormGroup;
  public changes: any;
  private file: any;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected cd: ChangeDetectorRef,
              protected store$: Store<fromRoot.State>,
              protected fb: FormBuilder,
              protected tournamentResource: TournamentResourceService,
              protected tournamentLoad: TournamentLoadService) {
    super(route, router, cd, store$, fb, tournamentLoad);
  }

  ngOnInit() {
    this.initParams();

    this.tournament$.subscribe((t) => {
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onFileLoad(files) {
    this.file = files[0];
  }

  onSave(route = null) {
    let tournamentId = null;
    this.tournamentId$
      .pipe(
        tap(id => tournamentId = id),
        switchMap(id => {
          if (!!this.file) {
            return this.tournamentResource.importPlayers(id, this.file);
          } else {
            return of(true);
          }
        })
      )
      .subscribe(() => {
        if (route !== null) {
          this.router.navigate([`/account/events/${this.mode}/${tournamentId}/${route}`]);
        }
      });
  }
}
