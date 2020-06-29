import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IAuthor, INews } from './news.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface INewsPagination {
  limit?: number;
  offset?: number;
  tags?: string;
  categories?: string[];
  per_page?: number;
  page?: number;
}

interface INewsResponse {
  count: number;
  next: string;
  previous: string;
  results: INewsFromResponse[];
}

interface INewsFromResponse {
  id: number;
  title: string;
  preview: string;
  featured_image: string;
  video_link: string;
  pub_datetime: string;
  slug: string;
  topic: string;
  author: { username: string };
  content: string;
  categories: Array<{ id: number; name: string }>;
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

  getAll(filters: INewsPagination = {}) {
    const params: any = {};
    Object.assign(params, filters);
    if (params.tags) {
      params.tags = `[${params.tags}]`;
    }

    return this.http.get<INewsResponse>(`${environment.endpoint}/news/`, {params})
      .pipe(
        map(response => {
          return response.results.map(newsItem => this.parseNewsResponseItem(newsItem));
        })
      );
  }

  loadNews(filters: INewsPagination = {}, customUrl?: string): Observable<INewsResponse> {
    if (customUrl) {
      return this.http.get<INewsResponse>(customUrl);
    }

    const params: any = {};
    Object.assign(params, filters);
    if (params.tags) {
      params.tags = `[${params.tags}]`;
    }

    if (this.countNews !== null && params.page > Math.ceil(this.countNews / NEWS_PER_PAGE)) {
      // Skip request if page is out of range
      return of();
    }

    return this.http.get<INewsResponse>(`${environment.endpoint}/news/`, {params});
  }

  getBySlug(slug: string) {
    const url = `${environment.endpoint}/news/${slug}/`;
    return this.http.get<INewsFromResponse>(url)
      .pipe(
        map(response => this.parseNewsResponseItem(response))
      );
  }

  getCategoriesBySlug(tournament_slug: string) {
    const params = {slug: tournament_slug};
    // get link to new by tournament slug
    return this.http.get<INewsCategoryItem[]>(`${environment.newsUrl}/categories`, {params});
  }

  parseNewsResponseItem(newsItem: INewsFromResponse): INews {
    return {
      id: newsItem.id,
      title: newsItem.title,
      timestamp: newsItem.pub_datetime,
      slug: newsItem.slug,
      tags: newsItem.categories,
      image: {
        full: newsItem.featured_image,
        medium: null,
      },
      author: this.parseNewsAuthor(newsItem),
      topic: newsItem.topic,
      content: newsItem.content,
      tournament_name: null,
    };
  }

  parseNewsAuthor(newsItem: any): IAuthor {
    return {
      avatar: {
        full: null
      },
      name: newsItem.author && newsItem.author.username,
    };
  }
}
