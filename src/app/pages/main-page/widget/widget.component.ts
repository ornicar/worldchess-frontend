import {Component, Input, OnChanges} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {shareReplay, switchMap} from 'rxjs/operators';
import * as fromWidget from '../../../../widget/app/services/widget.reducer';
import {IWidget} from '../../../../widget/app/services/widget.service';
import * as fromRoot from '../../../reducers';
import {OnChangesInputObservable, OnChangesObservable} from '../../../shared/decorators/observable-input';
import { WidgetLifeCycleService } from '../../../../widget/app/services/widget-life-cycle.service';


@Component({
  selector: 'wc-main-page-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class MainPageWidgetComponent implements OnChanges {
  @Input()
  widgetId: IWidget['id'];

  @OnChangesInputObservable()
  public widgetId$ = new BehaviorSubject<IWidget['id']>(this.widgetId);

  private selectWidget = fromWidget.selectWidget();

  public widget$: Observable<IWidget> = this.widgetId$.pipe(
    switchMap(id => this.widgetLifeCycleService.load(id)),
    switchMap(({ id }) => this.store$.pipe(
      select(this.selectWidget, { widgetId: id })
    )),
    shareReplay(1)
  );

  constructor(
    private store$: Store<fromRoot.State>,
    private widgetLifeCycleService: WidgetLifeCycleService
  ) {}

  @OnChangesObservable()
  ngOnChanges() {
  }
}
