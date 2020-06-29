import {Type} from "@angular/core";

export class HolderItem {
  constructor(public component: Type<any>, public data?: any, public props?: any) {}
}
