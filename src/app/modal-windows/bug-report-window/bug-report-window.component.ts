import { Observable } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from './../../account/account-store/account.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TypeOfBug } from './type-of-bug.enum';
import { ErrorStateMatcher } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

const TypeOfBugDscr: {
    type: TypeOfBug,
    codeLoc: string,
 }[] = [
  {
    type: null,
    codeLoc: 'BUG_LIST.NULL'
  },
  {
    type: TypeOfBug.MOVES,
    codeLoc: 'BUG_LIST.MOVES'
  },
  {
    type: TypeOfBug.TIME_CALCULATION,
    codeLoc: 'BUG_LIST.TIME_CALCULATION'
  },
  {
    type: TypeOfBug.RATING_CALCULATION,
    codeLoc: 'BUG_LIST.RATING_CALCULATION'
  },
  {
    type: TypeOfBug.GAME_FINISHED_SUDDENLY,
    codeLoc: 'BUG_LIST.GAME_FINISHED_SUDDENLY'
  },
  {
    type: TypeOfBug.OPINION,
    codeLoc: 'BUG_LIST.OPINION'
  },
  {
    type: TypeOfBug.BUG,
    codeLoc: 'BUG_LIST.BUG'
  },
  {
    type: TypeOfBug.MEMBERSHIP_AND_BILLING,
    codeLoc: 'BUG_LIST.MEMBERSHIP_AND_BILLING'
  },
  {
    type: TypeOfBug.OTHER,
    codeLoc: 'BUG_LIST.OTHER'
  },
];

export class FormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'bug-report-window',
  templateUrl: 'bug-report-window.component.html',
  styleUrls: ['bug-report-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BugReportWindowComponent  {
  public report: string;
  public bugTypes = TypeOfBugDscr;
  public bugType: TypeOfBug = null;
  public validate = false;

  emailFormControl = new FormControl('', [
    Validators.email,
  ]);

  matcher = new FormErrorStateMatcher();

  constructor(
    private dialogRef: MatDialogRef<BugReportWindowComponent>,
    private accountService: AccountService,
    private translateService: TranslateService,
  ) {
      this.accountService.getLanguage().pipe(
        filter(lang => !!lang),
        take(1)
      ).subscribe((data) => {
        this.translateService.use(data);
      });
   }

  public getLocalName(code: string): Observable<string> {
    return this.translateService.get(code);
  }

  public cancel() {
    this.dialogRef.close();
  }


  public send() {
    this.validate = true;
    if (this.report && this.report.trim() && this.bugType) {
      this.dialogRef.close({
        type: this.bugType,
        report: this.report,
        email: this.emailFormControl.value || null
      });
    }
  }
}
