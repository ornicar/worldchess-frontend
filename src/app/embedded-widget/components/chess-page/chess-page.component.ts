import { Component, OnDestroy, OnInit } from '@angular/core';
import { select } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, pluck, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ChessBoardViewMode } from '@app/broadcast/chess/chess-page/chess-board/chess-board.component';
import { ChessPageComponent as ChessPageComponentBase } from '../../../broadcast/chess/chess-page/chess-page.component';
import { ClearCameras, GetCameras } from '@app/broadcast/core/camera/camera.actions';
import * as fromCamera from '../../../broadcast/core/camera/camera.reducer';
import { IWidgetConfig, WidgetStyle } from '../../widget-config';

@Component({
  selector: 'wcd-chess-page',
  templateUrl: './chess-page.component.html',
  styleUrls: ['./chess-page.component.scss']
})
export class ChessPageComponent extends ChessPageComponentBase implements OnInit, OnDestroy {
  public config$: Observable<IWidgetConfig> = this.activatedRoute.data.pipe(
    pluck('config')
  );

  public ChessBoardViewMode = ChessBoardViewMode;

  public canLoadVideo$ = this.tournament$.pipe(
    map(tournament => tournament.isFree),
    shareReplay(1)
  );

  private cameras$ = this.store$.pipe(
    select(fromCamera.selectAll),
    shareReplay(1)
  );

  public hasVideo$ = this.cameras$.pipe(
    map(cameras => cameras.length > 0),
    shareReplay(1)
  );

  public videoIsEnable$ = new BehaviorSubject(false);

  showVideo$ = combineLatest([this.hasVideo$, this.videoIsEnable$]).pipe(
    map(([hasVideo, videoIsEnable]) => hasVideo && videoIsEnable),
  );

  public get gameUrl() {
    const tournamentUrl = `${environment.applicationUrl}/tournament/${this.tournament.id}`;

    return this.board ? `${tournamentUrl}/pairing/${this.board.id}` : tournamentUrl;
  }

  public isLightStyle$ = this.config$.pipe(
    map(({style}) => style === WidgetStyle.Light)
  );

  goToWC() {
    window['gtag']('event', 'go', {
      event_category: 'widget',
      event_label: this.tournament.title,
    });
    window.open(this.gameUrl);
  }

  public onVideoEnableClick() {
    this.videoIsEnable$.next(!this.videoIsEnable$.value);
  }

  ngOnInit() {
    super.ngOnInit();

    this.subs.camerasLoadSub = combineLatest([this.tour$, this.canLoadVideo$])
      .subscribe(([tour, canLoadVideo]) => {
        this.store$.dispatch(new ClearCameras());

        if (canLoadVideo && tour) {
          this.store$.dispatch(new GetCameras({tourId: tour.id}));
        }
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    this.store$.dispatch(new ClearCameras());
  }
}
