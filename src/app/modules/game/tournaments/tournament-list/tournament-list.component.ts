import { AccountService } from './../../../../account/account-store/account.service';
import { take, distinctUntilChanged, map } from 'rxjs/operators';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IOnlineTournament } from '@app/modules/game/tournaments/models/tournament.model';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import * as moment from 'moment';
import * as locale_RU from 'moment/locale/ru';

@Component({
  selector: 'wc-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss'],
})
export class TournamentListComponent implements OnInit, OnChanges {
  @Input()
  onlineTournaments: IOnlineTournament[] = [];
  onlineTournaments$: BehaviorSubject<IOnlineTournament[]> = new BehaviorSubject([]);

  moment = moment;
  lang = 'en';

  constructor(private accountService: AccountService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['onlineTournaments']) {
      this.onlineTournaments$.next(changes['onlineTournaments'].currentValue);
    }
  }

  getMoment(dateTournament: string): Observable<string> {
    const localeLang = this.moment;
    return this.accountService.getLanguage().pipe(
      map((lang) => {
        if (lang === 'ru') {
          localeLang.locale(lang, locale_RU);
        } else {
          localeLang.locale(lang);
        }
        return localeLang(dateTournament).fromNow();
      })
    );
  }

  titleCaseWord(word: string) {
    if (!word) {
      return word;
    }
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }
}
