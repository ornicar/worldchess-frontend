import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {ScreenStateService} from '@app/shared/screen/screen-state.service';
import {Angulartics2GoogleTagManager} from 'angulartics2/gtm';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{

  constructor(
    angulartics2GoogleTagManager: Angulartics2GoogleTagManager,
    private screenState: ScreenStateService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    // Initialize screen locker with root element
    this.screenState.initialize(this.elementRef.nativeElement);
  }
}
