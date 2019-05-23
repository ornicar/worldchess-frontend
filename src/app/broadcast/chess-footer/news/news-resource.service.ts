import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {IAuthor, INews} from './news.model';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

export interface INewsFilters {
  tags?: string;
  categories?: string;
  per_page?: number;
  page?: number;
}

const DEFAULT_NEWS_PARAMS = {
  context: 'view',
  _embed: '',
};

interface INewsResponse {
  id: number;
  title: {rendered: string};
  date: string;
  status: string;
  content: {rendered: string};
  _embedded: {
    author: {avatar_urls: {96: string, 48: string}, name: string}[],
    'wp:term': {id: number, name: string}[][],
    'wp:featuredmedia': {media_details: {sizes: {full: {source_url: string}, medium: {source_url: string}}}}[],
  };
}

interface INewsCategoryItem {
  id: number;
}

const NEWS_PER_PAGE = 15;

@Injectable()
export class NewsResourceService {
  private countNews: number = null;

  constructor(private http: HttpClient) {
  }

  /**
   * Available after getAll() news
   * @returns {number}
   */
  get count() {
    return this.countNews;
  }

  getAll(filters: INewsFilters = {}) {
    const params: any = {};
    Object.assign(params, DEFAULT_NEWS_PARAMS);
    Object.assign(params, filters);
    if (params.tags) {
      params.tags = `[${params.tags}]`;
    }

    return this.http.get<INewsResponse[]>(`${environment.newsUrl}/posts/`, {params})
      .pipe(
        map(response => {
          return response.map(newsItem => this.parseNewsResponseItem(newsItem));
        })
      );
  }

  loadNews(filters: INewsFilters = {}) {
    const params: any = {};
    Object.assign(params, DEFAULT_NEWS_PARAMS);
    Object.assign(params, {per_page: NEWS_PER_PAGE, page: 1});
    Object.assign(params, filters);
    if (params.tags) {
      params.tags = `[${params.tags}]`;
    }

    if (this.countNews !== null && params.page > Math.ceil(this.countNews / NEWS_PER_PAGE)) {
      // Skip request if page is out of range
      return of([]);
    }

    return this.http.get<INewsResponse[]>(`${environment.newsUrl}/posts/`, {params, observe: 'response'})
      .pipe(
        map(response => {
          this.countNews = +response.headers.get('X-WP-Total');
          return response.body.map(newsItem => this.parseNewsResponseItem(newsItem));
        })
      );
  }

  get(id: number) {
    return this.http.get<INewsResponse>(`${environment.newsUrl}/posts/${id}/`, {params: DEFAULT_NEWS_PARAMS})
      .pipe(
        map(response => this.parseNewsResponseItem(response))
      );
  }

  getCategoriesBySlug(tournament_slug: string) {
    const params = {slug: tournament_slug};
    // get link to new by tournament slug
    return this.http.get<INewsCategoryItem[]>(`${environment.newsUrl}/categories`, {params});
  }

  private parseNewsResponseItem(newsItem: INewsResponse): INews {
    const out = {
      id: newsItem.id,
      title: newsItem.title.rendered,
      timestamp: newsItem.date,
      tags: [],
      image: {
        full: null,
        medium: null,
      },
      author: this.parseNewsAuthor(newsItem),
      topic: null,
      content: newsItem.content.rendered,
      tournament: null,
      is_published: newsItem.status === 'publish',
    };

    if (newsItem._embedded['wp:term'][1]) {
      out.tags = newsItem._embedded['wp:term'][1]
        .map(t => {
          return {id: t.id, name: t.name};
        });
    }

    if (newsItem._embedded['wp:term'][0] && newsItem._embedded['wp:term'][0][0]) {
      out.topic = newsItem._embedded['wp:term'][0][0];
      out.tournament = newsItem._embedded['wp:term'][0][0].name;
    }

    if (newsItem._embedded['wp:featuredmedia'] && newsItem._embedded['wp:featuredmedia'][0]) {
      out.image = {
        full: newsItem._embedded['wp:featuredmedia'][0].media_details.sizes.full.source_url,
        medium: newsItem._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url,
      };
    }

    return out;
  }

  private parseNewsAuthor(newsItem: any): IAuthor {
    return {
      avatar: {
        full: newsItem._embedded.author[0].avatar_urls['96'],
        medium: newsItem._embedded.author[0].avatar_urls['48'],
      },
      name: newsItem._embedded.author[0].name,
    };
  }
}
