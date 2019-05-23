import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input, NgZone,
  OnChanges,
  OnDestroy,
  OnInit, SimpleChanges
} from '@angular/core';
import {fromEvent, merge, Subject, Subscription} from 'rxjs';
import {throttleTime} from 'rxjs/operators';

@Component({
  selector: 'wc-broadcast-nav-protect',
  templateUrl: './broadcast-nav-protect.component.html',
  styleUrls: ['./broadcast-nav-protect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BroadcastNavProtectComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() check = false;

  @HostBinding('class.hide-text')
  get hideText() {
    return (this.clientWidth || 0) < 270;
  }

  private clientWidth;

  private updateClientWidthSub: Subscription;

  constructor(
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => this.updateClientWidthSub = fromEvent(window, 'resize')
      .pipe(throttleTime(100))
      .subscribe(() =>
        this.ngZone.run(
          () => this.updateClientWidth()
        )
      )
    );
  }

  ngAfterViewInit() {
    this.updateClientWidth();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.check) {
      this.updateClientWidth();
    }
  }

  private updateClientWidth() {
    this.clientWidth = this.elementRef.nativeElement
      ? this.elementRef.nativeElement.clientWidth
      : null;

    this.cd.markForCheck();
  }

  ngOnDestroy() {
    if (this.updateClientWidthSub) {
      this.updateClientWidthSub.unsubscribe();
    }
  }
}
