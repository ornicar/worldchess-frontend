import {
  Component,
  OnInit,
  AfterViewInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  OnDestroy,
  HostBinding,
} from '@angular/core';

import {EmojiService} from './emoji.service';
import {DomHelper} from '../../../../shared/helpers/dom.helper';
import {ObservableInput} from '../../../../shared/decorators/observable-input';
import {Observable} from 'rxjs/internal/Observable';
import {Subscription} from 'rxjs/internal/Subscription';
import {SubscriptionHelper} from '../../../../shared/helpers/subscription.helper';

// From site layout
const MAX_TEXTAREA_HEIGHT = 98;
const MIN_TEXTAREA_HEIGHT = 30;

@Component({
  selector: 'wc-emoji-input',
  templateUrl: './emoji-input.component.html',
  styleUrls: ['./emoji-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmojiInputComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() textArea: any;
  @Input() popupAnchor = 'top';
  @Input() inputClass = '';
  @Input() searchClass = '';
  @Input() model: any;
  @ObservableInput('model') model$: Observable<string>;
  @Input() focusInput$: Observable<boolean>;
  @Input() autofocus = false;
  @Input() closeAfterSelection = true;

  @Output() modelChange: any = new EventEmitter();
  @Output() setPopupAction: any = new EventEmitter();
  @Output() blur: any = new EventEmitter();
  @Output() focus: any = new EventEmitter();
  @Output() keyup: any = new EventEmitter();
  @Output() emojiClick: any = new EventEmitter();

  @ViewChild('textareaEl') textareaEl;
  @ViewChild('emojiSearch') emojiSearch;
  @ViewChild('hiddenTextEl') hiddenTextEl;

  public input = '';
  public filterEmojis = '';
  public filteredEmojis: any[];
  public allEmojis: Array<any>;
  public popupOpen = false;
  public lastCursorPosition = 0;

  @HostBinding('style.height.px') inputHeight = MIN_TEXTAREA_HEIGHT;

  private subs: {[key: string]: Subscription} = {};

  // private popupCloseListener: ISubscription;

  @Input() onEnter: Function = () => { };

  constructor(
    public emojiService: EmojiService,
    private cd: ChangeDetectorRef,
  ) {

  }

  ngOnInit() {
    if (this.setPopupAction) {
      this.setPopupAction.emit((status) => { this.openPopup(status); });
    }
    this.allEmojis = this.emojiService.getAll();
    this.clean();
    this.cd.markForCheck();

    this.subs.resize = this.model$.subscribe(() => setTimeout(() => this.resizeTextArea(), 0));

    this.subs.focus = this.focusInput$.subscribe(() => {
      this.textareaEl.nativeElement.focus();
      this.textareaEl.nativeElement.value += '';
    });
  }

  ngAfterViewInit() {
    if (this.autofocus) {
      if (this.textArea) {
        this.textareaEl.nativeElement.focus();
        this.cd.markForCheck();
      }
    }
  }

  ngOnChanges() {
    if (this.model !== this.input) {
      this.input = this.model;
      this.cd.markForCheck();
    }
  }

  ngOnDestroy(): void {
    SubscriptionHelper.unsubscribe(this.subs);
  }

  onKeyup(event) {
    this.updateCursor();
    if (this.keyup) {
      this.keyup.emit(event);
      this.cd.markForCheck();
    }
  }

  onBlur(event) {
    this.updateCursor();
    if (this.blur) {
      this.blur.emit(event);
      this.cd.markForCheck();
    }
  }

  onFocus(event) {
    this.updateCursor();
    if (this.focus) {
      this.focus.emit(event);
      this.cd.markForCheck();
    }
  }

  clean() {
    this.filterEmojis = '';
    this.filteredEmojis = this.getFilteredEmojis();
    this.cd.markForCheck();
  }

  openPopup(status: boolean = null) {
    if (status === null) {
      this.popupOpen = !this.popupOpen;
    } else {
      this.popupOpen = status;
    }
    this.cd.markForCheck();
  }

  updateFilteredEmojis() {
    this.filteredEmojis = this.getFilteredEmojis();
    this.cd.markForCheck();
  }

  getFilteredEmojis() {
    return this.allEmojis.filter((e) => {
      if (this.filterEmojis === '') {
        return true;
      } else {
        for (const alias of e.aliases) {
          if (alias.includes(this.filterEmojis)) {
            return true;
          }
        }
      }
      return false;
    });
  }


  onEmojiClick(e) {
    this.input = this.input.substr(0, this.lastCursorPosition) + e + this.input.substr(this.lastCursorPosition);
    this.modelChange.emit(this.input);
    this.emojiClick.emit(e);
    if (this.closeAfterSelection) {
      this.popupOpen = false;
      this.clean();
    }
    this.cd.markForCheck();
  }

  onKeyPress(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
    }
  }

  onKey(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      this.onEnter();
      this.resizeTextArea();
    }
    this.cd.markForCheck();
  }

  onChange(newValue) {
    this.updateCursor();
    if (newValue.trim()) {
      this.input = this.emojiService.emojify(newValue);
      this.model = this.input;
      this.modelChange.emit(this.input);
    } else {
      this.modelChange.emit('');
    }
    this.resizeTextArea();

    this.cd.markForCheck();
  }

  updateCursor() {
    if (this.textareaEl) {
      this.lastCursorPosition = this.textareaEl.nativeElement.selectionStart;
      this.cd.markForCheck();
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement) {
    if (DomHelper.isOutsideElement(this.emojiSearch, targetElement) && this.popupOpen) {
      this.popupOpen = false;
    }
  }

  private resizeTextArea() {
    const textArea = this.textareaEl.nativeElement;
    this.hiddenTextEl.nativeElement.innerHTML = this.input
      .split('\n')
      .map(s => '<div>' + s.replace(/\s\s/g, ' &nbsp;') + '</div>' + '\n')
      .join('');
    let height = this.hiddenTextEl.nativeElement.offsetHeight;
    height = Math.max(MIN_TEXTAREA_HEIGHT, height);
    height = Math.min(MAX_TEXTAREA_HEIGHT, height);
    this.inputHeight = height;

    textArea.style.overflowY = (height == MAX_TEXTAREA_HEIGHT) ? 'auto' : 'hidden';
    textArea.style.height = height + 'px';
  }
}
