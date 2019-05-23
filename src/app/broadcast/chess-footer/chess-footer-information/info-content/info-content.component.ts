import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import * as fromRoot from '../../../../reducers';
import { Tournament } from '../../../core/tournament/tournament.model';
import { map, tap } from 'rxjs/operators';
import { OnChangesInputObservable, OnChangesObservable } from '../../../../shared/decorators/observable-input';


@Component({
  selector: 'wc-info-content',
  templateUrl: './info-content.component.html',
  styleUrls: ['./info-content.component.scss']
})
export class InfoContentComponent implements OnInit, OnChanges {
  public tabsTitle = {about: 'About', press: 'Press', contacts: 'Contacts'};
  public selectedTab$ = new BehaviorSubject(null);

  @Input() public tournament;

  @OnChangesInputObservable('tournament')
  tournament$: Observable<Tournament> = new BehaviorSubject<Tournament>(this.tournament);

  tabs$ = this.tournament$.pipe(
    map(t => Object.keys(this.tabsTitle).filter(key => !!t[key])),
    tap(tabs => {
      if (!tabs.length) {
        this.selectedTab$.next(null);
      } else {
        this.selectedTab$.next(tabs[0]);
      }
    }),
  );

  content$ = combineLatest(this.tournament$, this.selectedTab$).pipe(
    map(([tournament, selectedTab]) => {
      if (!tournament || !selectedTab) {
        return '';
      }
      return tournament[selectedTab];
    })
  );

  constructor(private store$: Store<fromRoot.State>) { }

  ngOnInit() {
  }

  @OnChangesObservable()
  ngOnChanges() {
  }
  public selectContentTab(tab: string) {
    this.selectedTab$.next(tab);
  }

  public isActive(tab: string) {
    return this.selectedTab$ ? this.selectedTab$.value === tab : false;
  }
}
