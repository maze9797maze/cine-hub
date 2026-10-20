// api.ts：TMDB API 的配置和请求函数
import type { Movie } from './types';

// API Key 从环境变量读取（定义在 .env 文件里，不写死在代码中）
// import.meta.env 是 Vite 提供的「环境变量」对象，只有 VITE_ 开头的变量能读到
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

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
