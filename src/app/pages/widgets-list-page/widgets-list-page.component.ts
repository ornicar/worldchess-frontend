import {select, Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {GetWidgets} from '../../../widget/app/services/widget.actions';
import {selectWidgetsAll} from '../../../widget/app/services/widget.reducer';
import {IWidget} from '../../../widget/app/services/widget.service';
import * as fromRoot from '../../reducers';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'widgets-list-page',
  templateUrl: './widgets-list-page.component.html',
  styleUrls: ['./widgets-list-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetsListPageComponent implements OnInit, OnDestroy {
  public subs: Subscription[] = [];
  public widgetsList$: Observable<IWidget[]> = this.store$.pipe(
    select(selectWidgetsAll)
  );

  public widgetsList: IWidget[] = [];
  public selectedWidget: IWidget = null;

  public mainUrl = environment.backendUrl;

  constructor(
    private store$: Store<fromRoot.State>,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.store$.dispatch(new GetWidgets());

    this.subs.push(
      this.widgetsList$.subscribe((widgets) => {
        if (widgets && widgets.length) {
          this.widgetsList = widgets;
          this.selectedWidget = widgets[0];
          this.cd.markForCheck();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  public loadExampleWidget(widgetId) {
    if (widgetId !== this.selectedWidget.id) {
      this.selectedWidget = this.widgetsList.find(widget => widget.id === widgetId);
      this.cd.markForCheck();
    }
  }

  public safeWidgetUrl(widgetId) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`/widget/${widgetId}`);
  }
}
