import { DOCUMENT } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild, ViewChildren,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { fromEvent, Observable, of } from 'rxjs';
import { map, mapTo, take } from 'rxjs/operators';
import { DomHelper } from '../../../../shared/helpers/dom.helper';
import { SubscriptionHelper, Subscriptions } from '../../../../shared/helpers/subscription.helper';
import { ScreenStateService } from '../../../../shared/screen/screen-state.service';

@Component({
  selector: 'wc-header-select',
  templateUrl: './header-select.component.html',
  styleUrls: ['./header-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderSelectComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {

  @Input() name: string;

  @Input() options: any[] = [];

  @Input() selected: any;

  @Input() hideSelected = true;

  @Input() autocompletePlaceholder = 'Search by the name or country';

  @Input() autocompleteFields: string[] = [];

  @Input() autocompleteFunction: Function = null;

  @Input() isReadOnly: boolean;

  @Input() preloader = false;

  @Output() selectedChange = new EventEmitter<any>();

  @Input() simpleAsRegular = false;

  @ViewChild('dropdown', { static: false }) dropdown;

  public isMobile = false;

  showPreloader = false;

  get isAutocomplete(): boolean {
    return (this.autocompleteFields && this.autocompleteFields.length > 0) || Boolean(this.autocompleteFunction);
  }

  @ViewChildren('autocomplete', { read: ElementRef })
  private autocompleteElement: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('mustBeFixed', {read: ElementRef}) mustBeFixed: QueryList<ElementRef>;

  public autocompleteFormControl = new FormControl('');

  @HostBinding('class.open')
  private _isOpen = false;

  get isOpen() {
    return this._isOpen;
  }

  set isOpen(isOpen) {
    if (isOpen === this._isOpen) {
      return;
    }

    if (this.isMobile) {
      this.updateMobileSlide(isOpen).subscribe(_isOpen => {
        this._isOpen = _isOpen;
        this.cd.markForCheck();
      });
    } else {
      this._isOpen = isOpen;
      this.cd.markForCheck();
    }
  }

  selectedOption = null;
  optionsExcludeSelected = [];
  filteredOptions: any[] = [];
  alignLeft = false;

  get canChange() {
    return this.optionsExcludeSelected.length && !this.isReadOnly;
  }

  @ContentChild('option', { read: TemplateRef, static: true }) optionTemplate;
  @ContentChild('titleNonSelected', { read: TemplateRef, static: true }) titleNonSelectedTemplate;
  @ContentChild('titleSelected', { read: TemplateRef, static: true }) titleSelectedTemplate;
  @ContentChild('afterDropdownContent', { read: TemplateRef, static: true }) afterDropdownContentTemplate;

  private subs: Subscriptions = {};

  constructor(
    private cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    private screenState: ScreenStateService
  ) {
  }

  ngOnInit() {
    this.subs.onMatchMobile = this.screenState.matchMediaMobile$
      .subscribe(matches => this.onMatchMediaMobile(matches));

    this.subs.onAutocompleteInputChange = this.autocompleteFormControl.valueChanges
      .subscribe(filterString => {
        this.filteredOptions = this.filterOptions(this.optionsExcludeSelected, filterString.toLowerCase());
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected || changes.options) {
      const index = this.selected ? this.options.findIndex(item => item.id === this.selected.id) : -1;
      const isExist = index !== -1;
      this.selectedOption = isExist ? this.selected : null;

      const optionsExcludeSelected = isExist && this.hideSelected
        ? [
          ...this.options.slice(0, index),
          ...this.options.slice(index + 1)
        ]
        : [...this.options];

      this.optionsExcludeSelected = optionsExcludeSelected;

      if (this.isAutocomplete) {
        this.filteredOptions = this.filterOptions(optionsExcludeSelected, this.autocompleteFormControl.value.toLowerCase());
      }

      this.cd.detectChanges();
    }
  }

  ngAfterViewChecked() {
    this.mustBeFixed.forEach(el => this.screenState.addFixedElement(el.nativeElement));
  }

  private onMatchMediaMobile(isMatches: boolean) {
    this.isMobile = isMatches;
    this.cd.markForCheck();

    // Hide menu when screen changes.
    if (this.isOpen) {
      // Slide back mobile menu.
      if (!isMatches) {
        this.screenState.slideLeftBack()
          .subscribe(() => this.closeDropdown());
      } else {
        this.closeDropdown();
      }
    }
  }

  private updateMobileSlide(isOpen: boolean): Observable<boolean> {
    if (isOpen) {
      this.screenState.slideLeft();

      return of(isOpen);
    } else {
      return this.screenState.slideLeftBack().pipe(mapTo(isOpen));
    }
  }

  public onSelectClick() {
    if (this.isAutocomplete) {
      if (!this.isOpen) {
        this.openDropdown();
      }
    } else {
      this.toggleDropdown();
    }
  }

  toggleDropdown() {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown() {
    this.isOpen = true;
    this.cd.markForCheck();

    if (this.isAutocomplete && !this.isMobile) {
      // Clear the filter input and focus on it.
      this.autocompleteFormControl.reset('');
      this.autocompleteElement.changes
        .pipe(
          take(1), // Get first value after the input element been shown.
          map((queryList: QueryList<ElementRef<HTMLElement>>) => queryList.first.nativeElement)
        )
        .subscribe(element => {
          element.focus();

          // Update when dropdown item with search input is moved to a next line.
          this.updateAlignLeft();
          this.cd.detectChanges();
        });
    }

    this.updateAlignLeft();
    this.addOutsideClickListener();
    this.cd.detectChanges();
  }

  closeDropdown() {
    this.isOpen = false;
    this.updateAlignLeft();
    this.removeOutsideClickListener();
    this.cd.detectChanges();
  }

  simpleClose() {
    if (this.simpleAsRegular) {
      this.closeDropdown();
    } else {
      this._isOpen = false;
    }
  }

  changeOption(option) {
    this.selectedChange.emit(option);
    if (this.isMobile && this.preloader) {
      this.showPreloader = true;
    } else {
      this.closeDropdown();
    }
  }

  private addOutsideClickListener() {
    if (this.subs.onClickOutside) {
      this.subs.onClickOutside.unsubscribe();
    }

    // Close dropdown after click outside.
    this.subs.onClickOutside = fromEvent(
      this.document.documentElement,
      'click',
      {
        capture: true,
        once: true
      })
      .subscribe((event: MouseEvent) => {
        if (DomHelper.isOutsideElement(this.elementRef, event.target)) {
          this.closeDropdown();
        }
      });
  }

  private removeOutsideClickListener() {
    if (this.subs.onClickOutside) {
      this.subs.onClickOutside.unsubscribe();
    }
  }

  private updateAlignLeft() {
    if (!this.isOpen) {
      this.alignLeft = false;
      return;
    }
 
    const dropDownRect = this.dropdown.nativeElement.getBoundingClientRect();
    const selectRect = this.elementRef.nativeElement.getBoundingClientRect();
    const widthWithoutScroll = document.documentElement.clientWidth || (window.innerWidth - 20);
    if(widthWithoutScroll < dropDownRect.right && window.innerWidth > 1522) {
      this.alignLeft = true;
    }
  }

  ngOnDestroy() {
    this.isOpen = false;
    SubscriptionHelper.unsubscribe(this.subs);
    this.mustBeFixed.forEach(el => this.screenState.removeFixedElement(el.nativeElement));
  }

  private filterOptions(options: { [key: string]: string }[], filterString: string = ''): any[] {
    const filters: Array<(option: any) => boolean> = [];

    if (this.autocompleteFields && this.autocompleteFields.length) {
      filters.push(
        option => this.autocompleteFields.some(field => (option[field] || '').toLowerCase().includes(filterString))
      );
    }

    if (this.autocompleteFunction) {
      filters.push(
        option => this.autocompleteFunction(option, filterString)
      );
    }

    return options.filter(option => filters.reduce((passed, fn) => passed || fn(option), false));
  }
}
