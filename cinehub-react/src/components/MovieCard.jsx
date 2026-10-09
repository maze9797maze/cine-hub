// MovieCard 组件：单个电影/剧集的卡片（海报 + 评分 + 标题 + 收藏按钮）
//
// 接收 4 个 props：
//   - movie           ：电影数据对象（来自 TMDB API）
//   - isWatchlisted   ：这部电影是否已在追剧清单里（true/false）
//   - onToggleWatchlist：点收藏按钮时执行的函数
//   - onOpen          ：点击卡片时执行的函数（打开详情弹窗）

export default function MovieCard({ movie, isWatchlisted, onToggleWatchlist, onOpen }) {
  // 拼海报图片地址：
  // TMDB 返回的 poster_path 只是相对路径（如 "/abc.jpg"），
  // 要拼上前缀才是完整地址。没有海报时用占位图兜底。
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    // 整张卡片可点击：onClick={onOpen} 打开详情弹窗
    // cursor-pointer：鼠标移上去变成「小手」，提示可以点
    <div
      onClick={onOpen}
      className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col cursor-pointer"
    >
      {/* 海报图片容器（aspect-[2/3] 是宽高比 2:3，海报标准比例） */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
        {/* alt：电影用 title，电视剧用 name；loading="lazy" 表示懒加载省流量 */}
        <img
          src={posterUrl}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* 评分 Badge：有评分显示一位小数，没有显示 N/A */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-yellow-400 flex items-center gap-1 border border-white/10">
          ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </div>
      </div>

      {/* 卡片底部内容 */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-red-500 transition-colors">
            {movie.title || movie.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {movie.release_date || movie.first_air_date || '年份未知'}
          </p>
        </div>

        {/* 收藏按钮：isWatchlisted 决定它的颜色和文字
            onClick 里先 e.stopPropagation()：阻止事件「冒泡」到外层卡片，
            否则点收藏按钮会同时触发卡片 onClick（把弹窗也打开） */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(movie);
          }}
          className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            isWatchlisted
              ? 'bg-gray-800 text-red-400 border border-red-500/30 hover:bg-red-950'
              : 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20'
          }`}
        >
          {isWatchlisted ? '✓ 已在清单中' : '+ 加入追剧清单'}
        </button>
      </div>
    </div>
  );
}
