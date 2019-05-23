import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {IVariationMove, IVariationMovePredictionResponse} from './variation-move.model';

interface IVariationMovePredictionRequest {
  primary_key: string;
  move_number: number;
  is_white_move: boolean;
  fen: string;
  san: string;
}

@Injectable()
export class VariationMoveResourceService {

  constructor(private http: HttpClient) { }

  getPrediction(variationMove: IVariationMove) {
    const variationMoveRequest: IVariationMovePredictionRequest = {
      primary_key: variationMove.primary_key,
      move_number: variationMove.move_number,
      is_white_move: variationMove.is_white_move,
      fen: variationMove.fen,
      san: variationMove.san,
    };

    return this.http.post<IVariationMovePredictionResponse>(
      `${environment.endpoint}/move/variation/prediction/`,
      variationMoveRequest
    );
  }
}
