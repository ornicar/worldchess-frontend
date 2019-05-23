import {Component} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {selectProfile} from '../../auth/auth.reducer';
import * as fromRoot from '../../reducers/index';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent {

  profile$ = this.store.pipe(
    select(selectProfile)
  );

  constructor(private store: Store<fromRoot.State>) { }
}
