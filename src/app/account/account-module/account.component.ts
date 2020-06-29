import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import { selectCanUserCreateEvent, selectMyAccountRating } from '../account-store/account.reducer';
import { Observable } from 'rxjs';
import { IAccountRating } from '@app/account/account-store/account.model';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {

  ableToCreateEvent$ = this.store$.pipe(
    select(selectCanUserCreateEvent)
  );

  rating$: Observable<IAccountRating> = this.store$.pipe(select(selectMyAccountRating));
  rating: number;
  isFide = false;

  constructor(private store$: Store<fromRoot.State>) {
    this.rating$.subscribe((r) => {
      if (!r) return;
      if (r.fide_rating) {
        if (r.worldchess_rating > r.fide_rating) {
          this.rating = r.worldchess_rating;
        } else {
          this.rating = r.fide_rating;
          this.isFide = true;
        }
      } else {
        this.rating = r.worldchess_rating;
      }
    });
  }
}
