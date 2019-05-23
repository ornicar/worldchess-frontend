import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'bug-report-window',
  templateUrl: 'bug-report-window.component.html',
  styleUrls: ['bug-report-window.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BugReportWindowComponent {
  public report: string;

  constructor(
    private dialogRef: MatDialogRef<BugReportWindowComponent>,
  ) { }

  public cancel() {
    this.dialogRef.close();
  }

  public send() {
    if (this.report && this.report.trim()) {
      this.dialogRef.close(this.report);
    }
  }
}
