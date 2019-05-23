import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Input,
  OnChanges
} from '@angular/core';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { filter ,  switchMap } from 'rxjs/operators';
import { Tournament } from '../../core/tournament/tournament.model';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers/index';
import * as fromMedia from '../media-files/media-files.reducer';
import { IMediaBlock, IMediaFile } from '../media-files/media-files.model';
import {
  GetMediaBlocksByTournamentId,
  GetMediaFilesFromBlock,
  GetMediaFilesFromAllBlocks,
  ClearAllMedia,
  GetCoverPhotos
} from '../media-files/media-files.actions';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { OnChangesInputObservable, OnChangesObservable } from '../../../shared/decorators/observable-input';

@Component({
  selector: 'wc-chess-footer-media',
  templateUrl: './chess-footer-media.component.html',
  styleUrls: ['./chess-footer-media.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessFooterMediaComponent implements OnInit, OnDestroy, OnChanges {
  public tournamentSs: Subscription;
  public blocksSs: Subscription;
  public countsSs: Subscription;
  public mediaSs: Subscription;
  public coversSs: Subscription;
  public loadingSs: Subscription;

  @Input() tournament = null;
  @OnChangesInputObservable('tournament')
  public tournament$: Observable<Tournament> = new BehaviorSubject<Tournament>(this.tournament);
  public mediaBlocks$: Observable<IMediaBlock[]> = this.store$.select(fromMedia.selectAll);
  public mediaLists$: Observable<{ [block_id: number]: fromMedia.MediaListRecord }> = this.store$.select(fromMedia.selectAllMedia);
  public countsList$: Observable<{ [block_id: number]: number }> = this.store$.select(fromMedia.selectAllCounts);
  public coversList$: Observable<IMediaFile[]> = this.store$.select(fromMedia.selectAllCovers);
  public loading$: Observable<boolean> = this.store$.select(fromMedia.selectLoading);

  public blocks: IMediaBlock[] = [];
  public counts;
  public media: { [block_id: number]: fromMedia.MediaListRecord }; // @TODO check if needed
  public blocksOffsets = {};
  public selectedOffset;
  public selectedBlockId;
  public selectedBlockIndex;
  public selectedMedia: IMediaFile;

  public cover: IMediaFile;
  public coverTime: string;
  public tournamentId;

  public shouldSelectMedia;
  public loading = true;
  public desktopWidth = 1024;

  public limit = 6;
  constructor(
    private store$: Store<fromRoot.State>,
    private cd: ChangeDetectorRef,
    public ngxModalService: NgxSmartModalService) { }

  ngOnInit() {
    this.loadingSs = this.loading$.subscribe(loading => this.loading = loading);
    this.recalculateLimit();
    this.cd.markForCheck();
    this.tournamentSs = this.tournament$
      .pipe(filter(tournament => Boolean(tournament)))
      .subscribe((tournament) => {
        this.store$.dispatch(new ClearAllMedia);
        this.store$.dispatch(new GetMediaBlocksByTournamentId({ tournament_id: `${tournament.id}` }));
        this.store$.dispatch(new GetCoverPhotos());
        this.tournamentId = tournament.id;
      });

    // may be here take one?
    this.blocksSs = this.mediaBlocks$.pipe(
      switchMap((mediaBlocks) => {
        this.blocks = mediaBlocks;
        mediaBlocks.forEach((block) => {
          this.blocksOffsets = {
            ...this.blocksOffsets,
            [block.id]: 0
          };
        });
        // @TODO ASK BAKEND TO SUPPORT MULTI-PARAMS
        this.getRecordsForAllBlocks(mediaBlocks);
        this.cd.markForCheck();
        return this.coversList$;
      }),
    )
      .subscribe((covers) => {
        this.cover = covers && covers.length > 0 ? covers
          .find((cover: IMediaFile) => !!this.blocks.find((block) => block.id === cover.block))
          : null;

        if (this.cover) {
          for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].id === this.cover.block) {
              this.coverTime = this.blocks[i].datetime;
              break;
            }
          }
        } else {
          this.coverTime = '';
        }


        this.cd.markForCheck();
      });

    this.countsSs = this.countsList$.pipe()
      .subscribe((counts) => {
        this.counts = counts;
        this.cd.markForCheck();
      });

    this.mediaSs = this.mediaLists$.subscribe((media) => {
      this.media = media;
      if (this.shouldSelectMedia) {
        this.selectMedia();
      }
      this.cd.markForCheck();
    });
  }

  @OnChangesObservable()
  public ngOnChanges() {
  }

  public ngOnDestroy() {
    this.store$.dispatch(new ClearAllMedia);
    this.tournamentSs.unsubscribe();
    this.mediaSs.unsubscribe();
    this.countsSs.unsubscribe();
    this.blocksSs.unsubscribe();
    this.loadingSs.unsubscribe();
  }

  public onDataAdded(data) {
    switch (data) {
      case 'prev': this.onPrev();
        break;
      case 'next': this.onNext();
        break;
      default:
    }
  }

  public getRecordsForAllBlocks(blocks) {
    this.store$.dispatch(new GetMediaFilesFromAllBlocks({
      offsetsList: this.blocksOffsets,
      limit: `${this.limit}`,
      block_ids: blocks.map((block => `${block.id}`))
    }));
  }

  public getNextRecordsForBlock(block_id) {
    if (this.blocksOffsets[block_id] + this.limit < this.counts[block_id]) {
      this.blocksOffsets[block_id] += this.limit;
      this.store$.dispatch(new GetMediaFilesFromBlock({
        offset: this.blocksOffsets[block_id],
        limit: `${this.limit}`,
        block_id: `${block_id}`
      }));
    }
  }

  public loadMoreReacordsForBlock(block_id) {
    this.recalculateLimit();
    this.getNextRecordsForBlock(block_id);
    this.cd.markForCheck();
    // @TODO Add loading spinner;
  }

  public trackMediaBy(index, item: IMediaBlock) {
    return item.id;
  }

  public recalculateLimit() {
    const width = document.documentElement.clientWidth;
    if (width >= this.desktopWidth) {
      this.limit = 8;
    } else {
      this.limit = 6;
    }
  }

  public onOpenMedia({ idx, block_id }: { idx: number, block_id: number }) {
    this.selectedOffset = idx;
    this.selectedBlockId = block_id;
    this.selectedBlockIndex = this.blocks.findIndex((block) => block.id === block_id);
    this.ngxModalService.getModal('myModal').open();
    this.selectMedia();
    this.cd.markForCheck();
  }

  onPrev() {
    if (!this.isAbleToPrev()) {
      return;
    }
    if (this.selectedOffset === 0) {
      do {
        this.selectedBlockIndex -= 1;
        this.selectedBlockId = this.blocks[this.selectedBlockIndex].id;
      } while (this.counts[this.selectedBlockId] === 0);
      this.selectedOffset = this.counts[this.selectedBlockId] - 1;
    } else {
      this.selectedOffset -= 1;
    }
    this.selectMedia();
    this.cd.markForCheck();
  }

  onNext() {
    if (!this.isAbleToNext()) {
      return;
    }
    if (this.selectedOffset === this.counts[this.selectedBlockId] - 1) {
      do {
        this.selectedBlockIndex += 1;
        this.selectedBlockId = this.blocks[this.selectedBlockIndex].id;
      } while (this.counts[this.selectedBlockId] === 0);

      this.selectedOffset = 0;
    } else {
      this.selectedOffset += 1;
    }
    this.selectMedia();
    this.cd.markForCheck();
  }

  public isAbleToPrev() {
    if (!this.blocks || !this.counts || this.loading) {
      return false;
    }
    return this.selectedOffset > 0
      || this.selectedBlockIndex > 0;
  }

  public isAbleToNext() {
    if (!this.blocks || !this.counts || this.loading) {
      return false;
    }
    return this.selectedOffset < this.counts[this.selectedBlockId] - 2
      || this.selectedBlockIndex < this.blocks.length - 1;
  }

  public selectMedia() {
    if (this.media[this.selectedBlockId].list.length > this.selectedOffset) {
      this.selectedMedia = this.media[this.selectedBlockId].list[this.selectedOffset];
      this.ngxModalService.getModal('myModal').setData(this.selectedMedia, true);
      this.cd.markForCheck();
      this.shouldSelectMedia = false;
    } else {
      this.shouldSelectMedia = true;
      this.getNextRecordsForBlock(this.selectedBlockId);
    }
    this.cd.markForCheck();
  }

  public getMainImage() {
    return this.cover ? `url(${this.cover.image.full})` : '';
  }
}
