import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {HolderItem} from "@app/modules/main/components/main-page/holder-item";
import {MpHostDirective} from "@app/modules/main/components/main-page/main-page-component-holder/main-page-component-holder/mp-host.directive";

@Component({
  selector: 'main-page-component-holder',
  templateUrl: './main-page-component-holder.component.html',
  styleUrls: ['./main-page-component-holder.component.scss']
})
export class MainPageComponentHolderComponent implements OnInit {

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  @Input() full:boolean = false;

  @Input() item:HolderItem | undefined = undefined;

  @ViewChild(MpHostDirective, { read: MpHostDirective, static: true }) hostRef;

  ngOnInit() {
    this.loadComponent()
  }

  ngOnChanges() {
    this.loadComponent();
  }

  loadComponent() {
    if (this.item) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.item.component);

      const viewContainerRef = this.hostRef.viewContainerRef;
      viewContainerRef.clear();
      const componentRef = viewContainerRef.createComponent(componentFactory);
      (componentRef.instance).data = this.item.data;
      (componentRef.instance).full = this.full;
    }
  }
}
