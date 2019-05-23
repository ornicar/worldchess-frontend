import {Update} from '@ngrx/entity';
import {Action} from '@ngrx/store';
import { IWidget } from './widget.service';

export enum WidgetActionTypes {
  GetWidgets = '[Widget] Get all widgets',
  LoadWidgets = '[Widget] Load Widgets',
  AddWidget = '[Widget] Add Widget',
  AddWidgets = '[Widget] Add Widgets',
  UpdateWidget = '[Widget] Update Widget',
  UpdateWidgets = '[Widget] Update Widgets',
}

export class GetWidgets implements Action {
  readonly type = WidgetActionTypes.GetWidgets;

  constructor() {}
}

export class LoadWidgets implements Action {
  readonly type = WidgetActionTypes.LoadWidgets;

  constructor(public payload: { widgets: IWidget[] }) {}
}

export class AddWidget implements Action {
  readonly type = WidgetActionTypes.AddWidget;

  constructor(public payload: { widget: IWidget }) {}
}

export class AddWidgets implements Action {
  readonly type = WidgetActionTypes.AddWidgets;

  constructor(public payload: { widgets: IWidget[] }) {}
}

export class UpdateWidget implements Action {
  readonly type = WidgetActionTypes.UpdateWidget;

  constructor(public payload: { widget: Update<IWidget> }) {}
}

export class UpdateWidgets implements Action {
  readonly type = WidgetActionTypes.UpdateWidgets;

  constructor(public payload: { widgets: Update<IWidget>[] }) {}
}

export type WidgetActions =
  GetWidgets
 | LoadWidgets
 | AddWidget
 | AddWidgets
 | UpdateWidget
 | UpdateWidgets;

