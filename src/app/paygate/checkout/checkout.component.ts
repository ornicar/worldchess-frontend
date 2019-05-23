import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ScreenStateService} from '../../shared/screen/screen-state.service';
import {Plan} from '../dto/plan';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  @Input() selectedPlan: Plan;
  @Input() isAuthorized: boolean;

  @Output() hideCheckout = new EventEmitter;

  constructor(
    private screenService: ScreenStateService
  ) {
  }

  buyProcessStart = true;

  public ngOnInit() {
    this.screenService.lock();
  }

  close() {
    this.hideCheckout.emit();
  }

  public ngOnDestroy() {
    this.screenService.unlock();
  }
}
