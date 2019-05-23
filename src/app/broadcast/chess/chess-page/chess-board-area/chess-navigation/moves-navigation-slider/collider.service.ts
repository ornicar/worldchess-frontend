import {Injectable} from '@angular/core';

@Injectable()
export class ColliderService {

  constructor() { }

  /**
   * Is elements touch each other somehow
   */
  isOverlapped (el1: HTMLElement, el2: HTMLElement): boolean {
    const rects = this.getRectsObject(el1, el2);

    return !(
      rects.first.top > rects.second.bottom
      || rects.first.right < rects.second.left
      || rects.first.bottom < rects.second.top
      || rects.first.left > rects.second.right
    );
  }

  private getRectsObject (el1: HTMLElement, el2: HTMLElement): { first: ClientRect, second: ClientRect} {
    return {
      first: this.getRect(el1),
      second: this.getRect(el2),
    };
  }

  private getRect (selector: HTMLElement): ClientRect {
    return selector.getBoundingClientRect();
  }
}
