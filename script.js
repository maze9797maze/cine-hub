// ===== CineHub 交互脚本 =====

// ===== 一、TMDB 接口配置 =====
// API_KEY 是你的「钥匙」：TMDB 要求每个请求都带上它，用来确认你是合法用户。
const API_KEY = "24ccf1daac7e2a5635ab6cce5ff06878";
// API_BASE_URL 是接口的「根地址」：所有 TMDB 请求都从这个地址开始。
const API_BASE_URL = "https://api.themoviedb.org/3";
// IMAGE_BASE_URL 是海报/剧照图片的「根地址」：接口返回的只是图片文件名（poster_path），
// 要把它拼到这个地址后面才能得到完整图片网址。
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
// 占位图：当某部电影没有海报时，用这张灰底图顶上。
const PLACEHOLDER_POSTER = "https://placehold.co/300x450/2a2a2a/ffffff?text=No+Poster";
// 追剧清单存在浏览器 localStorage 里时用的「钥匙」（键名）。
const WATCHLIST_KEY = "cinehub_watchlist";

// ===== 流派映射字典 =====
// TMDB 返回的 genre_ids 是数字（比如 878），不是中文名。
// 这个字典负责「数字 → 中文名」的翻译，这样统计时才能把 878 显示成「科幻」。
const GENRE_MAP = {
  28: "动作",
  12: "冒险",
  16: "动画",
  35: "喜剧",
  80: "犯罪",
  99: "纪录片",
  18: "剧情",
  10751: "家庭",
  14: "奇幻",
  36: "历史",
  27: "恐怖",
  10402: "音乐",
  9648: "悬疑",
  10749: "爱情",
  878: "科幻",
  10770: "电视电影",
  53: "惊悚",
  10752: "战争",
  37: "西部",
  10759: "动作冒险",
  10762: "儿童",
  10763: "新闻",
  10764: "真人秀",
  10765: "科幻奇幻",
  10766: "肥皂剧",
  10767: "脱口秀",
  10768: "战争与政治"
};


// ===== 二、获取页面元素 =====
const grid = document.getElementById("movie-grid");       // 放卡片的容器
const searchForm = document.getElementById("search-form"); // 搜索表单
const searchInput = document.getElementById("search");     // 搜索输入框
const loadMoreBtn = document.getElementById("load-more");  // 「加载更多」按钮
const tabPopular = document.getElementById("tab-popular"); // 「热门推荐」标签
const tabWatchlist = document.getElementById("tab-watchlist"); // 「我的追剧清单」标签
const watchlistCountEl = document.getElementById("watchlist-count"); // 清单数量
const dashboardSection = document.getElementById("dashboard-section"); // 统计仪表盘区域

// 详情弹窗相关的元素
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalBody = document.getElementById("modal-body");   // 弹窗内容区，JS 往里填


// ===== 三、状态变量 =====
// allMovies：暂存「热门列表」拉回来的电影。
let allMovies = [];
// currentPage / totalPages：热门列表的分页状态。
let currentPage = 1;
let totalPages = 1;

// 追剧清单：从 localStorage 读出来。
// localStorage 只能存字符串，当初保存时用 JSON.stringify 转成了字符串；
// 这里用 JSON.parse 把它还原成数组。如果从没存过（getItem 返回 null），就用空数组兜底。
let watchlist = JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];

// currentTab 记录「现在显示的是哪个页面」：'popular'（热门）/ 'watchlist'（清单）/ 'search'（搜索）。
let currentTab = "popular";

// genreChartInstance：保存 Chart.js 环形图的「实例」。
// 为什么要存起来？因为 Chart.js 不能在同一个 canvas 上重复画图，
// 每次重新画之前必须先 destroy（销毁）旧图，否则图会叠在一起或报错。
let genreChartInstance = null;


// ===== 四、请求数据 =====

// 获取热门电影，page 参数用于翻页（一页 20 部）。
async function getPopularMovies(page = 1) {
  const url = `${API_BASE_URL}/movie/popular?api_key=${API_KEY}&language=zh-CN&page=${page}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("接口请求失败，状态码：" + response.status);
  }
  const data = await response.json();
  totalPages = data.total_pages;   // 记下总页数
  return data.results;
}

// 搜索影视作品（电影 + 电视剧）。
async function searchMedia(query) {
  // encodeURIComponent：把中文关键词转成 URL 能识别的格式，防止乱码。
  const url = `${API_BASE_URL}/search/multi?api_key=${API_KEY}&language=zh-CN&query=${encodeURIComponent(query)}&page=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("搜索失败，状态码：" + response.status);
  }
  const data = await response.json();
  // 只保留电影和剧集，过滤掉「人物」结果。
  return data.results.filter(item => item.media_type === "movie" || item.media_type === "tv");
}

// 获取某部影视的「完整详情 + 演职员表」。
// append_to_response=credits 是 TMDB 的精髓技巧：
// 一次请求就同时返回详情（简介、分类、年份…）和 credits（演员 + 工作人员），不用发两次请求。
async function getDetails(id, mediaType) {
  const type = mediaType === "tv" ? "tv" : "movie";
  const url = `${API_BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=zh-CN&append_to_response=credits`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("获取详情失败");
  }
  return response.json();
}


// ===== 五、渲染卡片 =====
// 兼容「电影」和「剧集」：电影用 title/release_date，剧集用 name/first_air_date。
function renderMovies(list) {
  grid.innerHTML = "";   // 先清空容器

  list.forEach(item => {
    const isTV = item.media_type === "tv";
    const title = item.title || item.name;
    const isFav = isInWatchlist(item.id);   // 这部是否已收藏

    // 卡片外壳。
    const card = document.createElement("div");
    card.className = "card";

    // 海报容器（包住图片、标签、收藏按钮，方便定位）。
    const posterBox = document.createElement("div");
    posterBox.className = "card__poster";

    const img = document.createElement("img");
    img.src = item.poster_path ? IMAGE_BASE_URL + item.poster_path : PLACEHOLDER_POSTER;
    img.alt = title;

    // 类型标签（右上角）。
    const badge = document.createElement("span");
    badge.className = "card__badge";
    badge.textContent = isTV ? "📺 剧集" : "🎬 电影";

    // 收藏按钮（右下角）。
    const favBtn = document.createElement("button");
    favBtn.className = "fav-btn" + (isFav ? " active" : "");
    favBtn.textContent = isFav ? "❤️ 已追" : "🤍 追剧";

    posterBox.appendChild(img);
    posterBox.appendChild(badge);
    posterBox.appendChild(favBtn);

    // 信息区：标题 + 评分。
    const info = document.createElement("div");
    info.className = "card__info";

    const titleEl = document.createElement("div");
    titleEl.className = "card__title";
    titleEl.textContent = title;

    const rating = document.createElement("div");
    rating.className = "card__rating";
    rating.textContent = "⭐ " + (item.vote_average ? item.vote_average.toFixed(1) : "暂无");

    info.appendChild(titleEl);
    info.appendChild(rating);

    card.appendChild(posterBox);
    card.appendChild(info);

    // 收藏按钮点击事件。
    favBtn.addEventListener("click", function (e) {
      // stopPropagation：阻止事件冒泡到卡片，避免点收藏时误触发「打开弹窗」。
      e.stopPropagation();
      toggleWatchlist(item);

      // 如果当前在「清单」页，toggleWatchlist 内部已经重新渲染整页，这里不用再手动改按钮；
      // 否则（热门/搜索页）手动更新当前这个按钮的外观。
      if (currentTab !== "watchlist") {
        const nowFav = isInWatchlist(item.id);
        favBtn.className = "fav-btn" + (nowFav ? " active" : "");
        favBtn.textContent = nowFav ? "❤️ 已追" : "🤍 追剧";
      }
    });

    // 卡片点击 → 打开详情弹窗。
    card.addEventListener("click", function () {
      openModal(item);
    });

    grid.appendChild(card);
  });
}


// ===== 六、状态提示 =====
function showLoading() {
  grid.innerHTML = '<div class="status">加载中…</div>';
}

// 空状态提示，可传自定义文字。
function showEmpty(message) {
  const text = message || "没找到相关影视作品，换个关键词试试吧 🎬";
  grid.innerHTML = '<div class="status">' + text + '</div>';
}

function showError(message) {
  grid.innerHTML = '<div class="status error">加载失败：' + message + '，请检查网络后重试。</div>';
  console.error(message);
}


// ===== 七、追剧清单（LocalStorage）=====

// 把清单保存到 localStorage，并刷新顶部计数。
function saveWatchlist() {
  // localStorage 只能存字符串，所以用 JSON.stringify 把数组转成字符串再存。
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  updateWatchlistCount();
}

function updateWatchlistCount() {
  watchlistCountEl.textContent = watchlist.length;
}

// 判断某部影视是否已在清单里（用 id 来找）。
function isInWatchlist(id) {
  return watchlist.some(item => item.id === id);
}

// 收藏 / 取消收藏：在清单里找到就移出，没找到就加入。
// 存的是「完整对象」，这样从清单点开卡片时，弹窗仍能拿到完整信息。
function toggleWatchlist(item) {
  const index = watchlist.findIndex(i => i.id === item.id);
  if (index >= 0) {
    watchlist.splice(index, 1);   // 已存在 → 移出（取消收藏）
  } else {
    watchlist.push(item);         // 不存在 → 加入（收藏）
  }
  saveWatchlist();

  // 如果正停在「清单」页操作，就立刻重渲染清单（取消收藏的卡片会消失），
  // 同时刷新统计仪表盘（数字和环形图要跟着变）。
  if (currentTab === "watchlist") {
    renderWatchlist();
    renderDashboard();
  }
}

// 渲染「我的追剧清单」页面。
function renderWatchlist() {
  if (watchlist.length === 0) {
    showEmpty("你的追剧清单还是空的，快去收藏几部吧 ❤️");
    return;
  }
  renderMovies(watchlist);
}


// ===== 八·五、追剧统计仪表盘 =====
// 用 Chart.js 把追剧清单的数据「清洗 + 统计」，画成环形图和数字卡片。

// 销毁旧图表（如果存在），并把实例引用清空。
// 为什么要清空引用？因为销毁过一次的图表不能再销毁第二次（会报错）；
// 清空后，下次 renderDashboard 就知道「现在没有图表了」，跳过销毁这步。
function destroyChart() {
  if (genreChartInstance) {
    genreChartInstance.destroy();
    genreChartInstance = null;
  }
}

function renderDashboard() {
  const totalCountEl = document.getElementById("stat-total-count");
  const avgRatingEl = document.getElementById("stat-avg-rating");
  const chartEmptyEl = document.getElementById("chart-empty");   // 「暂无数据」提示

  // 清单为空：数字归零、销毁图表，并显示「暂无数据」提示。
  if (watchlist.length === 0) {
    totalCountEl.textContent = "0";
    avgRatingEl.textContent = "0.0";
    destroyChart();
    chartEmptyEl.classList.remove("hidden");
    return;
  }

  // 1. 计算总追剧数：就是清单数组的长度。
  const total = watchlist.length;

  // 2. 计算平均评分：用 reduce 把所有剧的 vote_average 加起来，再除以总数。
  //    (item.vote_average || 0)：没有评分的剧当 0 算，避免算出 NaN。
  const totalRating = watchlist.reduce((sum, item) => sum + (item.vote_average || 0), 0);
  const avgRating = (totalRating / total).toFixed(1);   // toFixed(1) 保留 1 位小数

  totalCountEl.textContent = total;
  avgRatingEl.textContent = avgRating;

  // 3. 统计流派频次。
  //    genreCounts 是一个对象：键是中文流派名，值是这个流派出现的次数。
  //    比如收藏了《星际穿越》(科幻) + 《盗梦空间》(科幻/悬疑) + 《摩登家庭》(喜剧)，
  //    结果就是 { 科幻: 2, 悬疑: 1, 喜剧: 1 }。
  const genreCounts = {};
  watchlist.forEach(item => {
    const ids = item.genre_ids || [];   // 没有 genre_ids 字段就当空数组，避免报错
    ids.forEach(id => {
      const name = GENRE_MAP[id] || "其他";   // 字典里查不到的流派归到「其他」
      genreCounts[name] = (genreCounts[name] || 0) + 1;
    });
  });

  // 4. 取出出现次数最多的 TOP 5 流派。
  //    Object.entries 把 { 科幻: 2, 悬疑: 1 } 变成 [["科幻", 2], ["悬疑", 1]] 这种「键值对」数组；
  //    sort((a, b) => b[1] - a[1]) 按第二项（次数）从大到小排序；
  //    slice(0, 5) 只截取前 5 个。
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 如果一部剧都没有流派信息（topGenres 为空），同样显示「暂无数据」。
  if (topGenres.length === 0) {
    destroyChart();
    chartEmptyEl.classList.remove("hidden");
    return;
  }

  // 有数据 → 隐藏提示，正常画图。
  chartEmptyEl.classList.add("hidden");

  // 5. 用 Chart.js 画环形图。
  //    getContext("2d") 拿到 canvas 的「2D 画笔」，Chart.js 需要它来作画。
  const ctx = document.getElementById("genre-chart").getContext("2d");
  destroyChart();   // 先销毁旧图，再画新图，避免在同一个 canvas 上重复画

  genreChartInstance = new Chart(ctx, {
    type: "doughnut",   // doughnut = 环形图（中间空心的饼图）
    data: {
      labels: topGenres.map(g => g[0]),   // 中文流派名：["科幻", "悬疑", ...]
      datasets: [{
        data: topGenres.map(g => g[1]),   // 出现次数：[2, 1, ...]
        backgroundColor: ["#e50914", "#ff9900", "#36a2eb", "#9966ff", "#4bc0c0"], // 5 种颜色对应最多 5 块
        borderWidth: 0                    // 块与块之间不留白边
      }]
    },
    options: {
      responsive: true,           // 跟随容器大小自动缩放
      maintainAspectRatio: false, // 不强制保持宽高比，好让图填满 .chart-wrapper
      plugins: {
        legend: {
          position: "bottom",    // 图例放底部
          labels: { color: "#ccc", font: { size: 12 } }
        }
      }
    }
  });
}


// ===== 八、标签页切换 =====
function deactivateTabs() {
  tabPopular.classList.remove("active");
  tabWatchlist.classList.remove("active");
}

// 加载热门列表（回到第一页）。
async function loadPopular() {
  showLoading();
  try {
    currentPage = 1;
    allMovies = await getPopularMovies(1);
    renderMovies(allMovies);
  } catch (err) {
    showError(err.message);
  }
}

function switchTab(tab) {
  currentTab = tab;
  searchInput.value = "";   // 切换标签时清空搜索框
  deactivateTabs();

  if (tab === "popular") {
    tabPopular.classList.add("active");
    loadMoreBtn.style.display = "block";   // 热门页显示「加载更多」
    dashboardSection.classList.add("hidden");   // 热门页隐藏统计仪表盘
    loadPopular();
  } else if (tab === "watchlist") {
    tabWatchlist.classList.add("active");
    loadMoreBtn.style.display = "none";    // 清单页没有分页，隐藏按钮
    dashboardSection.classList.remove("hidden");   // 清单页显示统计仪表盘
    renderWatchlist();
    renderDashboard();   // 渲染统计仪表盘（环形图 + 数字）
  }
}

tabPopular.addEventListener("click", function () { switchTab("popular"); });
tabWatchlist.addEventListener("click", function () { switchTab("watchlist"); });


// ===== 九、详情弹窗 =====

// 打开弹窗：先显示「加载中」，再去请求完整详情，拿到后填充。
async function openModal(item) {
  const mediaType = item.media_type === "tv" ? "tv" : "movie";

  // 先清空并显示加载提示，同时让弹窗显示出来。
  modalBody.innerHTML = '<div class="status">加载详情中…</div>';
  modal.classList.add("show");

  try {
    // 拿着 id 发第二次请求，拿完整详情 + 演职员表。
    const data = await getDetails(item.id, mediaType);
    renderModalContent(data, mediaType);
  } catch (err) {
    modalBody.innerHTML = '<div class="status error">获取详情失败，请重试。</div>';
    console.error(err);
  }
}

// 把详情数据渲染进弹窗。
function renderModalContent(data, type) {
  const isTV = type === "tv";
  const title = data.title || data.name;
  // 上映/首播日期只取年份：用 slice(0, 4) 截取前四位，比如 "2014-11-07" → "2014"。
  const year = (data.release_date || data.first_air_date || "").slice(0, 4);
  // backdrop_path 是横向剧照大图，比竖版海报更适合做顶部 banner。
  const backdrop = data.backdrop_path ? IMAGE_BASE_URL + data.backdrop_path : "";

  // 分类标签（genres 是一串 { id, name } 对象，用 map 转成 HTML 标签）。
  const genres = data.genres && data.genres.length
    ? data.genres.map(g => '<span class="genre-tag">' + g.name + '</span>').join("")
    : "";

  // 导演：从 crew（工作人员）里找 job 是 "Director" 的那个人。
  const director = data.credits && data.credits.crew
    ? data.credits.crew.find(p => p.job === "Director")
    : null;
  const directorName = director ? director.name : "未知";

  // 主演：取前 5 位演员的名字，用 " / " 连起来。
  const cast = data.credits && data.credits.cast
    ? data.credits.cast.slice(0, 5).map(c => c.name).join(" / ")
    : "暂无";

  // 用模板字符串一次性拼出弹窗内容，塞进 modalBody。
  modalBody.innerHTML = `
    ${backdrop ? `<div class="modal__banner" style="background-image: url('${backdrop}')"></div>` : ""}
    <div class="modal__content">
      <h2 class="modal__title">${title} <span class="modal__year">(${year})</span></h2>
      ${genres ? `<div class="modal__genres">${genres}</div>` : ""}
      <p class="modal__rating">⭐ ${data.vote_average ? data.vote_average.toFixed(1) : "暂无"}</p>
      <p class="modal__meta">导演：${directorName}</p>
      <div class="modal__section">
        <h4>剧情简介</h4>
        <p class="modal__text">${data.overview || "暂无详细剧情简介。"}</p>
      </div>
      <div class="modal__section">
        <h4>主演阵容</h4>
        <p class="modal__text">${cast}</p>
      </div>
    </div>
  `;
}

// 关闭弹窗，并清空内容（下次打开重新填充）。
function closeModal() {
  modal.classList.remove("show");
  modalBody.innerHTML = "";
}

modalClose.addEventListener("click", closeModal);

// 点弹窗外面那片黑色背景也能关闭。
// e.target === modal 的意思是「你点的就是那层遮罩本身」，而不是里面的内容。
modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    closeModal();
  }
});

// 按 Esc 键也能关闭弹窗。
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});


// ===== 十、搜索表单提交 =====
searchForm.addEventListener("submit", async function (e) {
  // 阻止表单默认的「刷新页面」行为，实现无刷新切换。
  e.preventDefault();

  const query = searchInput.value.trim();

  // 输入为空 → 回到热门页。
  if (!query) {
    switchTab("popular");
    return;
  }

  // 有输入 → 进入搜索页。
  currentTab = "search";
  deactivateTabs();
  loadMoreBtn.style.display = "none";   // 搜索页暂时没有分页

  showLoading();
  try {
    const results = await searchMedia(query);
    if (results.length === 0) {
      showEmpty();
    } else {
      renderMovies(results);
    }
  } catch (err) {
    showError(err.message);
  }
});


// ===== 十一、加载更多（只作用于热门列表）=====
loadMoreBtn.addEventListener("click", async function () {
  if (currentPage >= totalPages) {
    loadMoreBtn.textContent = "没有更多了";
    return;
  }

  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "加载中…";

  try {
    currentPage++;
    const more = await getPopularMovies(currentPage);
    allMovies = allMovies.concat(more);
    renderMovies(allMovies);
  } catch (err) {
    showError(err.message);
  } finally {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "加载更多";
  }
});


// ===== 十二、启动 =====
function init() {
  updateWatchlistCount();   // 页面打开时先把清单计数显示正确
  loadPopular();            // 加载热门列表
}

init();
