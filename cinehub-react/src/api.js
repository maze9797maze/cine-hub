// api.js：TMDB API 的配置和请求函数
// 把「请求数据」的逻辑单独放一个文件，App.jsx 里 import 就能用

// 你的 TMDB API Key（和 CineHub v1.0 用的是同一个）
const API_KEY = '24ccf1daac7e2a5635ab6cce5ff06878';

// TMDB API 的基础地址
const BASE_URL = 'https://api.themoviedb.org/3';

// fetchPopular：获取当天热门影视（电影 + 电视剧混合）
// async 表示这是异步函数，await 表示「等请求完成再继续往下走」
export const fetchPopular = async () => {
  const res = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=zh-CN`);
  if (!res.ok) throw new Error('网络请求失败');   // 状态码不是 200 就抛错
  const data = await res.json();                   // 把响应解析成 JS 对象
  return data.results;                             // 只返回结果数组
};

// searchMovies：根据关键词搜索影视
export const searchMovies = async (query) => {
  // encodeURIComponent：把搜索词（中文、空格等）转成 URL 能识别的格式
  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=zh-CN&query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('搜索请求失败');
  const data = await res.json();
  return data.results;
};
