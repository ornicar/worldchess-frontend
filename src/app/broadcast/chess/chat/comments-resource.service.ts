import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

export interface ICommentProfile {
  avatar: {};
  full_name: string;
  id: number;
  paid: boolean;
  nickname?: string;
}

export interface ICommentMove {
  move_number: number;
  is_white_move: boolean;
}

export enum CommentType {
  Comment = 0,
  Move = 1
}

export enum CommentVote {
  dislike = -1,
  ignore = 0,
  like = 1
}

export interface IComment {
  id: number;
  created: string;
  board: number;
  chat?: string;
  likes: number;
  dislikes: number;
  comment_type: CommentType;
  text?: string;
  current_user_vote?: CommentVote;
  user?: ICommentProfile;
  move?: ICommentMove;
}

interface ICommentsResponse {  // @TODO transform it to generic model PaginationResponse<T>
  /*count: number; does not provided from backend
   next?: string;
   previous?: string;*/
  results: IComment[];
}

export interface IMapHttpParams {
  [param: string]: string | string[];
}

export interface ICommentParams extends IMapHttpParams {
  board?: string;
  chat?: string;
  limit?: string;
  offset?: string;
  chat_id?: string;
}

interface ICommentsRequest {
  text: string;
  move_number?: number;
  board?: number;
  chat?: string;
}

@Injectable()
export class CommentsResourceService {
  constructor(
    private http: HttpClient,
  ) { }

  public get(id: number) {
    return this.http.get<IComment>(`${environment.endpoint}/comments/${id}/`);
  }

  public getAll(params: ICommentParams): Observable<ICommentsResponse> {
    return this.http.get<ICommentsResponse>(`${environment.endpoint}/comments/`, { params });
  }

  public send(comment: ICommentsRequest) {
    return this.http.post<any>(`${environment.endpoint}/comments/`, comment);
  }

  public like(commentId: number) {
    return this.http.post<IComment>(
      `${environment.endpoint}/comments/${commentId}/vote/`,
      {vote: 1}
    );
  }

  public unlike(commentId: number) {
    return this.http.delete<IComment>(`${environment.endpoint}/comments/${commentId}/delete_vote/`);
  }

  public dislike(commentId: number) {
    return this.http.post<IComment>(
      `${environment.endpoint}/comments/${commentId}/vote/`,
      {vote: -1}
      );
  }
}
