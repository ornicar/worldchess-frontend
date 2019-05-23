import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AlertWindowComponent, IAlertWindowData } from './alert-window/alert-window.component';
import { Observable } from 'rxjs';
import { BugReportWindowComponent } from './bug-report-window/bug-report-window.component';

@Injectable()
export class ModalWindowsService {
  constructor(
    private dialog: MatDialog,
  ) { }

  public alert(title: string, message: string, width: number = 550): Observable<void> {
    const data: IAlertWindowData = {
      title,
      message,
    };

    return this.dialog.open(AlertWindowComponent, {
      width: `${width}px`,
      data,
    }).afterClosed();
  }

  public bugReport(): Observable<string> {
    return this.dialog.open(BugReportWindowComponent, {
      disableClose: true,
    }).afterClosed();
  }
}
