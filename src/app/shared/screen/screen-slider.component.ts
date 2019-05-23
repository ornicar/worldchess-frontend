import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {Component, HostBinding, HostListener, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionHelper, Subscriptions} from '../helpers/subscription.helper';
import {ScreenSlideState, ScreenStateService} from './screen-state.service';

@Component({
  selector: 'wc-screen-slider',
  template: `<ng-content></ng-content>`,
  styles: [`:host { display: block; }`],
  animations: [
    trigger('slide', [
      state(ScreenSlideState.Normal, style({ transform: 'none' })),
      state(ScreenSlideState.Left, style({ transform: 'translate3d(-100%, 0, 0)' })),
      state(ScreenSlideState.Right, style({ transform: 'translate3d(100%, 0, 0)' })),
      transition(
        `${ScreenSlideState.Normal} <=> ${ScreenSlideState.Left}`,
        animate('380ms ease-in')
      )
    ])
  ]
})
export class ScreenSliderComponent implements OnInit, OnDestroy {

  @HostBinding('@slide') slideState: ScreenSlideState = ScreenSlideState.Normal;

  private subs: Subscriptions = {};

  constructor(
    private screenState: ScreenStateService
  ) { }

  ngOnInit() {
    this.subs.slide = this.screenState.slideState$.subscribe(slideState => this.slideState = slideState);
  }

  @HostListener('@slide.start', ['$event']) onSlideStart(event: AnimationEvent) {
    if (event.fromState === ScreenSlideState.Normal
      && (event.toState === ScreenSlideState.Left || event.toState === ScreenSlideState.Right)
    ) {
      const scrollTop = this.screenState.scrollTop;

      this.screenState.fixedElements.forEach(elm => {
        if (window.getComputedStyle(elm).position  === 'fixed') {
          elm.style.top = `${scrollTop}px`;
        }
      });
    }
  }

  @HostListener('@slide.done', ['$event']) onSlideDone(event: AnimationEvent) {
    if (event.toState === ScreenSlideState.Normal
      && (event.fromState === ScreenSlideState.Left || event.fromState === ScreenSlideState.Right)
    ) {
      this.screenState.fixedElements.forEach(elm => {
        elm.style.removeProperty('top');
      });
    }

    this.screenState.onSlideAnimationDone(event);
  }

  ngOnDestroy() {
    SubscriptionHelper.unsubscribe(this.subs);
  }
}
