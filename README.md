# 🎬 CineHub - 个人影视追剧看板与流派统计 Dashboard

> 一个基于原生 JavaScript 和 TMDB API 构建的暗黑风格追剧看板，支持影视搜索、收藏持久化存储以及个性化追剧流派数据可视化分析。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)

🌐 **在线预览网址**：[https://maze9797maze.github.io/cine-hub/](https://maze9797maze.github.io/cine-hub/)

---

## ✨ 核心功能特性

- 🎬 **热门推介与全局搜索**：接入 TMDB 官方 API，实时渲染最新热门电影/剧集，支持关键词检索。
- 📖 **剧集详情弹窗 (Modal)**：点击海报卡片唤起模态框，展示海报大图、剧照、剧情简介、上映年份及主要主演名单。
- ❤️ **追剧清单 (LocalStorage)**：支持一键收藏/取消收藏剧集，利用浏览器 `localStorage` 实现前端数据持久化存储。
- 📊 **流派数据可视化 (Chart.js)**：根据已收藏的剧集流派，自动清洗并统计生成 TOP 5 偏好流派环形图（如：科幻/悬疑/喜剧）。
- 📱 **响应式暗黑 UI**：基于 CSS Grid 与 Flexbox 布局，自适应 PC 端与移动端显示，支持点击遮罩 / 关闭按钮 / 键盘 `Esc` 快捷关闭。

---

## 🛠️ 技术栈与工具

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端基础** | HTML5 / CSS3 / ES6+ JavaScript | 原生 Vanilla JS，无第三方前端框架依赖 |
| **数据来源** | TMDB RESTful API | 异步 API 数据获取 (`Fetch API` + `Async/Await`) |
| **本地存储** | Web Storage API (`localStorage`) | 纯前端用户数据持久化 |
| **图表展示** | Chart.js | 数据提取、清洗与可视化渲染 |
| **构建部署** | Git / GitHub Pages | 版本管理 + 公网静态托管 |

---

## 🚀 本地开发指引

1. **克隆仓库**
   ```bash
   git clone https://github.com/maze9797maze/cine-hub.git
   cd cine-hub
   ```

2. **配置 API Key**
   在 `script.js` 中填入你的 [TMDB API Key](https://www.themoviedb.org/settings/api)：
   ```javascript
   const API_KEY = 'YOUR_TMDB_API_KEY';
   ```

3. **运行项目**
   直接双击打开 `index.html` 或使用 VS Code 的 `Live Server` 扩展启动。

---

## 💡 技术收获与反思

1. 掌握了异步 JavaScript 开发流程，理解了 `Promise`、`async/await` 在实际 API 数据请求与异常捕获（`try/catch`）中的应用。
2. 实践了纯前端的数据流控制与组件解耦逻辑（从数据获取 -> `localStorage` 保存 -> 图表数据结构转换与重构）。
3. 深入应用了 CSS Grid 响应式布局以及 CSS 定位/层级（`position: fixed`, `z-index`）控制模态框与防冒泡设计。
