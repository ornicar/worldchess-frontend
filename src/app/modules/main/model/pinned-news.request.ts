import {IPaginationParams} from "@app/broadcast/chess-footer/team-players/team-players-resource.service";
import {NewsType} from "@app/modules/main/model/pinned-news";

export interface PinnedNewsRequest {
    news_type:NewsType,
    limit?: number;
    offset?: number;
}
