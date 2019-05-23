
export class LockScroll {
  private _locked = false;
  private toLock = false;
  private toUnlock = false;
  private _scrollChange = false;
  public scrollTop = null;
  private _lockEvents = null;

  get scrollChange() {
    return this._scrollChange;
  }

  get locked() {
    return this._locked;
  }

  set locked(val) {
    if (val !== this._locked) {

      // Block events after first change scroll position.
      this.addLockListener();
      if (val) {
        this.toLock = true;
      } else {
        this.toUnlock = true;
      }

      this._locked = val;
    }
  }

  constructor(private contentWrap) {
  }

  public lock() {
    if (!this.locked) {
      this.locked = true;
      this._scrollChange = true;
      this.scrollTop = document.scrollingElement.scrollTop;
      const elements = this.getElements();

      // To prevent document scrolling while menu is opened on mobile, we set up document height to viewport height.
      elements.forEach(elm => {
        elm.style.overflow = 'hidden';
        // elm.scrollTop = 0;
        // elm.scrollTo(0, 0);
        // elm.style.height = `calc(100vh - ${elm.offsetTop || 0}px)`;
        elm.style.height = `100%`;
      });

      // Prevent scrolling to the top of the screen when document height changed.
      // Note that we need to set scroll before document height is changed.
      elements[0].scrollTop = this.scrollTop;
      document.scrollingElement.scrollTop = 0;
    }
  }

  public unlock() {
    if (this.locked) {
      const elements = this.getElements();

      elements.forEach(elm => {
        elm.style.removeProperty('overflow');
        elm.style.removeProperty('height');
      });

      elements[0].scrollTop = 0;
      document.scrollingElement.scrollTop = this.scrollTop;
      this.locked = false;
    }
  }

  private getElements() {
    return [
      this.contentWrap,
      document.querySelector('body'),
      document.documentElement
    ];
  }

  private addLockListener() {
    if (!this._lockEvents) {
      this._lockEvents = this.lockEvents.bind(this);
      window.addEventListener('scroll', this._lockEvents, true);
    }
  }

  private removeLockListener() {
    if (this._lockEvents) {
      window.removeEventListener('scroll', this._lockEvents, true);
      this._lockEvents = null;
    }
  }

  private lockEvents(e) {
    // Block events after first change scroll position.
    if (this.toLock || this.toUnlock) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (this.toUnlock) {
      this.removeLockListener();
    }

    this.toLock = this.toUnlock = false;
  }
}
