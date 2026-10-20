// types.ts：全项目共享的 TypeScript 类型定义
// 把所有「数据长什么样」集中在这里，组件里 import 就能用

// Movie：一部电影/剧集的数据结构（对应 TMDB 返回的字段）
// 带 ? 的字段表示「可选」（可能没有）；`string | null` 表示「要么字符串、要么 null」
export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  popularity?: number;
  genre_ids?: number[];
  overview?: string;
  media_type?: string;
}

// Tab：页签类型，只能是这两个值之一
export type Tab = 'popular' | 'watchlist';

export interface MovieCardProps {
  movie: Movie;
  isWatchlisted: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onOpen: () => void;
}

export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

export interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

export interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

export interface GenreChartProps {
  watchlist?: Movie[];
}
