import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { selectMainSelling } from '../../../purchases/selling/selling.reducer';
import { map } from 'rxjs/operators';
import { IProductWithExpand } from '../../../purchases/product/product.model';
import { IPlan } from '../../../purchases/plan/plan.model';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  @Input() fixed = true;
  @Input() general = false;

  hidden = false;
  // @TODO_PURCHASES NOT HARDCODE PURCHASES, WAIT FOR DESIGN AND CHANGES

  selling$ = this.store$.pipe(
    select(selectMainSelling)
  );

  subscriptions$ = this.selling$.pipe(
    map((selling) => {
      if (selling) {
        return this.subscriptions(selling.main_plan, selling.main_product); // @todo fix it.
      } else {
        return [];
      }
    })
  );

  isPaygatePage = this.router.url === '/paygate';

  constructor(private router: Router, private store$: Store<fromRoot.State>) { }

  ngOnInit() {
    window.addEventListener('scroll', this.documentScrollListener);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.documentScrollListener);
  }

  documentScrollListener = () => {
    if (this.fixed) {
      this.hidden = this.footerBottomIsVisible();
    }
  }

  private subscriptions = (plan: IPlan, product: IProductWithExpand) => {
    return [
      {
        id: product.stripe_id,
        link: '/paygate',
        target: 'route',
        title: 'Online Access to the Match 2018',
        price: product.price,
        buttonCaption: `get ${product.tournament ? product.tournament.additional_title : product.stripe_id}`,
        gstAction: 'main-match-access'
      },
      {
        id: plan.stripe_id,
        link: '/paygate',
        target: 'route',
        title: '12-month Online Pass',
        oldPrice: null,
        price: plan.amount,
        buttonCaption: 'get my 12-month pass',
        gstAction: 'main-subscription'
      },
      {
        link: 'https://www.ticketmaster.co.uk/World-Chess-Championships-tickets/artist/5274704',
        target: 'blank',
        title: 'Watch live at the College',
        soon: 'Join the list',
        buttonCaption: 'get the ticket',
        gstAction: 'main-college'
      }
    ];
  }
  private footerBottomIsVisible() {
    const footerBottomElem = document.querySelector('.footer-bottom');

    // Все позиции элемента
    const targetPosition = {
      top: window.pageYOffset + footerBottomElem.getBoundingClientRect().top,
      left: window.pageXOffset + footerBottomElem.getBoundingClientRect().left,
      right: window.pageXOffset + footerBottomElem.getBoundingClientRect().right,
      bottom: window.pageYOffset + footerBottomElem.getBoundingClientRect().bottom
    };

    const windowPosition = {
      top: window.pageYOffset,
      left: window.pageXOffset,
      right: window.pageXOffset + document.documentElement.clientWidth,
      bottom: window.pageYOffset + document.documentElement.clientHeight
    };

    // Если позиция нижней части элемента больше позиции верхней части окна, то элемент виден сверху
    const isTopVisible = targetPosition.bottom > windowPosition.top;

    // Если позиция верхней части элемента меньше позиции нижней части окна, то элемент виден снизу
    const isBottomVisible = targetPosition.top < windowPosition.bottom;

    // Если позиция правой стороны элемента больше позиции левой части окна, то элемент виден слева
    const isLeftVisible = targetPosition.right > windowPosition.left;

    // Если позиция левой стороны элемента меньше позиции правой части окна, то элемент виден справа
    const isRightVisible = targetPosition.left < windowPosition.right;

    return isTopVisible && isRightVisible && isBottomVisible && isLeftVisible;
  }

  getClasses() {
    const classes = [];

    if (this.hidden) {
      classes.push('hidden');
    }

    if (this.fixed) {
      classes.push('fixed');
    }

    if (this.general) {
      classes.push('general');
    }

    return classes.join(' ');
  }

  navigate(item) {
    const navBarElement = document.querySelector('.navbar');
    const planElement = document.querySelector(`.broadcast.${item.id}`);

    if (planElement) {
      window.scrollTo(0, window.pageYOffset + planElement.getBoundingClientRect().top - navBarElement.clientHeight);
    }

    return false;
  }
}
