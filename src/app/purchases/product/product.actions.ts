import {Action} from '@ngrx/store';
import { IProduct } from './product.model';
import { Update } from '@ngrx/entity';


export enum ProductActionTypes {
  GetProducts = '[Product] Get all Products',
  LoadProducts = '[Product] Load Products',
  AddProduct = '[Product] Add Product',
  // UpsertProduct = '[Product] Upsert Product',
  AddProducts = '[Product] Add Products',
  // UpsertProducts = '[Product] Upsert Products',
  UpdateProduct = '[Product] Update Product',
  UpdateProducts = '[Product] Update Products',
  DeleteProduct = '[Product] Delete Product',
  DeleteProducts = '[Product] Delete Products',
  ClearProducts = '[Product] Clear Products'
}

export class GetProducts implements Action {
  readonly type = ProductActionTypes.GetProducts;

  constructor() {}
}

export class LoadProducts implements Action {
  readonly type = ProductActionTypes.LoadProducts;

  constructor(public payload: { products: IProduct[] }) {}
}

export class AddProduct implements Action {
  readonly type = ProductActionTypes.AddProduct;

  constructor(public payload: { product: IProduct }) {}
}

export class AddProducts implements Action {
  readonly type = ProductActionTypes.AddProducts;

  constructor(public payload: { products: IProduct[] }) {}
}

export class UpdateProduct implements Action {
  readonly type = ProductActionTypes.UpdateProduct;

  constructor(public payload: { product: Update<IProduct> }) {}
}

export class UpdateProducts implements Action {
  readonly type = ProductActionTypes.UpdateProducts;

  constructor(public payload: { products: Update<IProduct>[] }) {}
}

export class DeleteProduct implements Action {
  readonly type = ProductActionTypes.DeleteProduct;

  constructor(public payload: { id: number }) {}
}

export class DeleteProducts implements Action {
  readonly type = ProductActionTypes.DeleteProducts;

  constructor(public payload: { ids: number[] }) {}
}

export class ClearProducts implements Action {
  readonly type = ProductActionTypes.ClearProducts;
}

export type ProductActions =
 LoadProducts
 | AddProduct
 | AddProducts
 | UpdateProduct
 | UpdateProducts
 | DeleteProduct
 | DeleteProducts
 | ClearProducts;
