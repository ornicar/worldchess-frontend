import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Tournament } from '../../broadcast/core/tournament/tournament.model';
import { IProduct, IProductWithExpand } from './product.model';

@Injectable()
export class ProductResourceService {

  constructor(private http: HttpClient) { }

  private expandProduct(productExpanded: IProductWithExpand): { tournament?: Tournament, product: IProduct } {
    const tournament = productExpanded.tournament;

    const product = {
      ...productExpanded,
      tournament: tournament ? tournament.id : null,
    };

    return {
      tournament,
      product
    };
  }

  get(stripeId: string): Observable<{ tournament?: Tournament, product: IProduct }> {
    return this.http.get<IProductWithExpand>(`${environment.endpoint}/products/${stripeId}/`).pipe(
      map(productExpanded => this.expandProduct(productExpanded))
    );
  }

  getAll(): Observable<{ tournaments: Tournament[], products: IProduct[] }> {
    return this.http.get<IProductWithExpand[]>(`${environment.endpoint}/products/`).pipe(
      map(productsExpanded => productsExpanded.reduce(
        (accumulator, productExpanded) => {
          const {tournament, product} = this.expandProduct(productExpanded);

          return {
            tournaments: tournament ? accumulator.tournaments.concat(tournament) : accumulator.tournaments,
            products: accumulator.products.concat(product),
          };
        },
        {
          tournaments: [],
          products: [],
        }
      ))
    );
  }
}
