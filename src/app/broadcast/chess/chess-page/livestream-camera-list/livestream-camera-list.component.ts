import { Component, Input, EventEmitter, Output, HostListener, ElementRef } from '@angular/core';
import { ICamera } from '@app/broadcast/core/camera/camera.model';

@Component({
  selector: 'wc-livestream-camera-list',
  templateUrl: './livestream-camera-list.component.html',
  styleUrls: ['./livestream-camera-list.component.scss']
})
export class LiveStreamCameraListComponent {
  @Input() main = false;
  @Input() label = '';
  @Input() compare = '';
  @Input() prefix = '';
  @Input() list: object[] = [];
  @Input() selectedItem: object;

  @Output() itemSelected = new EventEmitter();
  @Output() goPremium = new EventEmitter();

  constructor(private elementRef: ElementRef) {}

  isOpened = false;

  toggleList(value?: boolean) {
    if (typeof value !== 'undefined') {
      this.isOpened = value;
    } else {
      this.isOpened = !this.isOpened;
    }
  }

  onItemClick(event: MouseEvent, item: ICamera) {
    event.stopPropagation();
    this.toggleList(false);
    if (item.link_display) {
      this.itemSelected.emit(item);
    } else {
      this.goPremium.emit();
    }
  }

  getItemLabel(item): string {
    return item ? item[this.label] || '' : '';
  }

  isActive(item): boolean {
    return item && this.selectedItem ? item[this.compare] === this.selectedItem[this.compare] : false;
  }

  @HostListener('document:click', ['$event']) clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.toggleList(false);
    }
  }
}
