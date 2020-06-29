import { BehaviorSubject } from 'rxjs';
// import { Destroy } from 'destroy.class';
import { OnDestroy } from '@angular/core';

export abstract class Loading
  // extends Destroy
  implements OnDestroy
{

  loading$ = new BehaviorSubject(false);

  ngOnDestroy() {
    this.loading$.complete();
    // super.ngOnDestroy();
  }
}
