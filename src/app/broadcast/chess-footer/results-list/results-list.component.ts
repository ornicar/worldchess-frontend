import {Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, OnChanges, ChangeDetectorRef} from '@angular/core';
import { Store } from '@ngrx/store';
import {ScreenStateService} from '../../../shared/screen/screen-state.service';
import * as fromCountry from '../../core/country/country.reducer';
import * as fromRoot from '../../../reducers/index';
import { ICountry } from '../../core/country/country.model';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Result, IResultRecord, IPlayerResults } from '../../core/result/result.model';

@Component({
  selector: 'wc-results-list',
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() playersResults: IPlayerResults[] = [];
  @Input() classic: IResultRecord[] = [];
  @Input() rapid: IResultRecord[] = [];
  @Input() blitz: IResultRecord[] = [];
  @Input() armageddon: IResultRecord[] = [];
  @Input() isEnd = false;

  private subs: Subscription[] = [];
  public wholeScores: { [key: number]: { color: string, score: number }[] } = {};
  public countries: ICountry[] = [];

  private PHONE_WIDTH = 54;
  private TABLET_WIDTH = 75;

  private isFullTablet = false;

  public get itemWidth() {
    return this.isFullTablet ? this.TABLET_WIDTH : this.PHONE_WIDTH;
  }

  constructor(
    private cd: ChangeDetectorRef,
    private store$: Store<fromRoot.State>,
    private sanitizer: DomSanitizer,
    private screenState: ScreenStateService,
    ) { }

  ngOnInit() {
    this.subs.push(this.store$.select(fromCountry.selectAll)
      .subscribe(countries => {
        this.countries = countries;
      }));

    this.subs.push(
      this.screenState.matchMediaTabletFull$.subscribe(matches => {
        this.isFullTablet = !matches;
        this.cd.markForCheck();
      })
    );
  }

  ngOnChanges() {
    this.playersResults.forEach(playerResults => this.wholeScores[playerResults.player.fide_id] = []);

    [...this.classic, ...this.rapid, ...this.blitz, ...this.armageddon].forEach(item => {
      if (item.result === Result.WHITE_WIN) {
        this.wholeScores[item['white_player'].fide_id].push({ color: 'white', score: 1 });
        this.wholeScores[item['black_player'].fide_id].push({ color: 'black', score: 0 });

      } else if (item.result === Result.DRAW) {
        this.wholeScores[item['white_player'].fide_id].push({ color: 'white', score: 0.5 });
        this.wholeScores[item['black_player'].fide_id].push({ color: 'black', score: 0.5 });

      } else if (item.result === Result.BLACK_WIN) {
        this.wholeScores[item['black_player'].fide_id].push({ color: 'black', score: 1 });
        this.wholeScores[item['white_player'].fide_id].push({ color: 'white', score: 0 });

      } else {
        this.wholeScores[item['black_player'].fide_id].push({ color: 'black', score: null });
        this.wholeScores[item['white_player'].fide_id].push({ color: 'white', score: null });
      }
    });
  }

  public ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  public getCountryName(id) {
    const country = this.countries.find(item => item.id === id);
    return country ? country.long_code : '';
  }

  public getScoreHtml(score: number) {
    if (score === null) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    const scoreString = score === 0.5 ? '&#189' : `${score}`;
    return this.sanitizer.bypassSecurityTrustHtml(scoreString);
  }

}
