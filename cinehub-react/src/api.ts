// api.ts：TMDB API 的配置和请求函数
import type { Movie } from './types';

// 你的 TMDB API Key
const API_KEY = '24ccf1daac7e2a5635ab6cce5ff06878';

// TMDB API 的基础地址
const BASE_URL = 'https://api.themoviedb.org/3';

// fetchPopular：获取当天热门影视（电影 + 电视剧混合）
// 返回类型 Promise<Movie[]> 表示「异步地返回一个 Movie 数组」
export const fetchPopular = async (): Promise<Movie[]> => {
  const res = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=zh-CN`);
  if (!res.ok) throw new Error('网络请求失败');
  const data = (await res.json()) as { results: Movie[] };
  return data.results;
};

// searchMovies：根据关键词搜索影视
export const searchMovies = async (query: string): Promise<Movie[]> => {
  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=zh-CN&query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('搜索请求失败');
  const data = (await res.json()) as { results: Movie[] };
  return data.results;
};
