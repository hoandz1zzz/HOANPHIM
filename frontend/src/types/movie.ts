export interface CategoryGroup {
  group: { id: string; name: string };
  list: { id: string; name: string }[];
}

export interface EpisodeItem {
  name: string;
  slug: string;
  embed: string;
}

export interface EpisodeServer {
  server_name: string;
  items: EpisodeItem[];
}

export interface MovieItem {
  id: string;
  name: string;
  original_name: string;
  slug: string;
  year?: number;
  description: string;
  total_episodes: number;
  current_episode: string;
  time: string;
  quality: string;
  language: string;
  director: string | null;
  casts: string | null;
  thumb_url: string;
  thumb_url_webp?: string;
  poster_url: string;
  poster_url_webp?: string;
  created: string;
  modified: string;
}

export interface MovieDetail extends MovieItem {
  category: {
    '1'?: CategoryGroup; // Định dạng (Phim bộ / Phim lẻ)
    '2'?: CategoryGroup; // Thể loại (Hành động, Phiêu lưu...)
    '3'?: CategoryGroup; // Năm phát hành
    '4'?: CategoryGroup; // Quốc gia
  };
  tmdb?: { id: number; type: string; season: number | null; url: string };
  imdb?: { id: string; url: string };
  episodes: EpisodeServer[];
}

export interface PaginateInfo {
  current_page: number;
  total_page: number;
  total_items: number;
  items_per_page: number;
}

export interface NguoncListResponse {
  status: string;
  paginate?: PaginateInfo;
  items: MovieItem[];
}

export interface NguoncDetailResponse {
  status: string;
  movie: MovieDetail;
}

export interface HomeFeedResponse {
  newMovies: NguoncListResponse;
  seriesMovies: NguoncListResponse;
  singleMovies: NguoncListResponse;
  animeMovies: NguoncListResponse;
  actionMovies: NguoncListResponse;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieSlug: string;
  movieName: string;
  thumbUrl: string | null;
  posterUrl: string | null;
  quality: string | null;
  currentEpisode: string | null;
  createdAt: string;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  movieSlug: string;
  movieName: string;
  thumbUrl: string | null;
  posterUrl: string | null;
  episodeSlug: string;
  episodeName: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  movieSlug: string;
  content: string;
  createdAt: string;
}
