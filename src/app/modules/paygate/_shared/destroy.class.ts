import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export abstract class Destroy implements OnDestroy {

  destroy$ = new Subject();

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
