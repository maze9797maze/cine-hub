# 🎬 CineHub 追剧看板

一个基于 **TMDB API** 的影视追剧看板，纯静态网站（HTML + CSS + JavaScript），无框架、无构建工具。支持搜索、收藏、详情查看，并用 Chart.js 把追剧偏好可视化。

## ✨ 功能特性

- 🔥 **热门推荐** — 拉取 TMDB 热门电影，支持「加载更多」分页
- 🔍 **搜索** — 按关键词搜索电影与剧集（`search/multi`）
- ❤️ **追剧清单** — 收藏 / 取消收藏，`localStorage` 本地持久化
- 📊 **统计仪表盘** — Chart.js 环形图展示收藏的**流派占比**（TOP 5）、总追剧数、平均评分
- 🎞️ **详情弹窗** — 剧照大图、分类标签、导演、主演、剧情简介

## 🛠️ 技术栈

- 原生 JavaScript（`fetch` + `async/await`）
- TMDB API（热门 / 搜索 / 详情，`append_to_response=credits` 合并请求）
- Chart.js（CDN 引入，Doughnut 环形图）
- localStorage（追剧清单持久化）

## 🚀 在线体验

👉 [https://maze9797maze.github.io/cine-hub/](https://maze9797maze.github.io/cine-hub/)

## 🏃 本地运行

纯静态项目，直接双击 `index.html` 即可在浏览器打开；也可以用任意静态服务器：

```bash
python3 -m http.server 8000   # 然后访问 http://localhost:8000
```

## 📁 项目结构

```
CineHub/
├── index.html   # 页面结构
├── style.css    # 样式
└── script.js    # 交互逻辑 + TMDB 数据请求
```

## 🔑 TMDB API Key

`script.js` 顶部内置了一个免费的 TMDB v3 API Key。若需自己长期使用，请到 [TMDB](https://www.themoviedb.org/) 免费申请，替换 `API_KEY` 常量即可。

## 📚 主要技术点

- `fetch` / `async/await` 请求第三方 API 与错误处理
- `append_to_response=credits` 一次请求拿详情 + 演职员
- 数组高阶函数：`forEach` / `map` / `filter` / `reduce` / `sort` / `slice`
- 状态驱动 UI + `localStorage` 持久化
- Chart.js 环形图（动态销毁 / 重建实例）
