// MovieModal 组件：点击卡片后弹出的「剧集详情」模态框
// 用 Framer Motion 做进场 / 出场动画（淡入淡出 + 缩放弹入）
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MovieModalProps } from '../types';

export default function MovieModal({ movie, isOpen, onClose, isWatchlisted, onToggleWatchlist }: MovieModalProps) {
  // 按 Esc 键关闭模态框（keydown 事件里的 e 是浏览器的 DOM KeyboardEvent）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 拼背景大图地址（movie 可能为 null，用可选链 ?. 安全访问）
  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    // AnimatePresence：负责「组件从页面移除时」也能播放退场动画
    <AnimatePresence>
      {isOpen && movie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 半透明黑色遮罩：点击遮罩 = 关闭 */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 详情卡片主体 */}
          <motion.div
            className="relative w-full max-w-3xl bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 顶部横版背景图 */}
            {backdropUrl && (
              <div className="relative h-56 md:h-72">
                <img
                  src={backdropUrl}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              </div>
            )}

            {/* 详情内容区 */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">
                  {movie.title || movie.name}
                </h2>
                <button
                  onClick={onClose}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              {/* 元信息：评分 / 年份 / 类型 */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-400">
                <span className="text-yellow-400 font-bold">
                  ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </span>
                <span>{movie.release_date || movie.first_air_date || '年份未知'}</span>
                {movie.media_type && (
                  <span className="bg-gray-800 px-2 py-0.5 rounded text-xs uppercase">
                    {movie.media_type === 'movie' ? '电影' : '剧集'}
                  </span>
                )}
              </div>

              {/* 剧情简介 */}
              <p className="mt-4 text-sm text-gray-300 leading-relaxed line-clamp-4">
                {movie.overview || '暂无简介'}
              </p>

              {/* 底部收藏按钮 */}
              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`mt-6 w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  isWatchlisted
                    ? 'bg-gray-800 text-red-400 border border-red-500/30 hover:bg-red-950'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isWatchlisted ? '✓ 已在追剧清单中' : '+ 加入追剧清单'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
