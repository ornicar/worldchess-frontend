import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertWindowComponent, IAlertWindowData } from './alert-window/alert-window.component';
import { Observable } from 'rxjs';
import { BugReportWindowComponent } from './bug-report-window/bug-report-window.component';
import { IConfirmWindowData, ConfirmWindowComponent } from './confirm-window/confirm-window.component';
import { TypeOfBug } from './bug-report-window/type-of-bug.enum';
import { AlertWithCountdownComponent, IAlertWithCountdownWindowData } from '@app/modal-windows/alert-with-countdown/alert-with-countdown.component';
import { AlertConnectComponent } from '@app/modal-windows/alert-connect/alert-connect.component';

@Injectable()
export class ModalWindowsService {
  constructor(
    private dialog: MatDialog,
  ) { }

  /**
   * @desc Displaying an alert message or information message
   * @param {string} title empty by default
   * @param {string} message
   * @param {number} [width=550]
   * @returns {Observable<void>}
   * @memberof ModalWindowsService
   */
  public alert(title: string = '', message: string, width: number = 550): Observable<void> {

    const data: IAlertWindowData = {
      title,
      message,
    };

    return this.dialog.open(AlertWindowComponent, {
      panelClass: 'alert-pop-up',
      hasBackdrop: false,
      width: `${width}px`,
      data,
    }).afterClosed();
  }

  public alertWithCountDown(title: string, message: string, width: number = 550, date: string): Observable<void> {
    const data: IAlertWithCountdownWindowData = {
      title,
      message,
      date
    };

    return this.dialog.open(AlertWithCountdownComponent, {
      panelClass: 'alert-pop-up',
      hasBackdrop: false,
      width: `${width}px`,
      data,
    }).afterClosed();
  }

  public bugReport(): Observable<{report: string, type: TypeOfBug}> {
    return this.dialog.open(BugReportWindowComponent, {
      disableClose: true,
    }).afterClosed();
  }

  public confirm(title: string, message: string, width: number = 550, buttonTrue?: string, buttonFalse?: string): Observable<boolean> {
    const data: IConfirmWindowData = {
      title,
      message,
      buttonTrue,
      buttonFalse,
    };

    return this.dialog.open(ConfirmWindowComponent, {
      width: `${width}px`,
      data,
    }).afterClosed();
  }

  public alertConnect(): Observable<void> {
    return this.dialog.open(AlertConnectComponent, {
      panelClass: 'alert-connect',
      disableClose: true
    }).afterClosed();
  }

  /**
   * Close all dialog
   * @memberof ModalWindowsService
   */
  public closeAll() {
    this.dialog.closeAll();
  }
}
