import { useState, useEffect } from 'react';
import Header from './components/Header';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import GenreChart from './components/GenreChart';
import SkeletonGrid from './components/SkeletonGrid';
import { fetchPopular, searchMovies } from './api';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Movie, Tab } from './types';

export default function App() {
  // 状态（尖括号里是类型，如 useState<Movie[]> 表示「Movie 数组」）
  const [activeTab, setActiveTab] = useState<Tab>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useLocalStorage<Movie[]>('cinehub_watchlist', []);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 加载热门影视
  const loadPopularMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPopular();
      setMovies(data);
    } catch (err) {
      setError('无法获取影视数据，请检查 API Key 或网络');
    } finally {
      setLoading(false);
    }
  };

  // 组件首次渲染完成后执行一次
  useEffect(() => {
    loadPopularMovies();
  }, []);

  // 处理搜索
  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      loadPopularMovies();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await searchMovies(query);
      setMovies(data);
    } catch (err) {
      setError('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 重试：有搜索词→重新搜索，否则→重新拉热门
  const handleRetry = () => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      loadPopularMovies();
    }
  };

  // 收藏切换
  const handleToggleWatchlist = (movie: Movie) => {
    const exists = watchlist.some((item) => item.id === movie.id);
    if (exists) {
      setWatchlist(watchlist.filter((item) => item.id !== movie.id));
    } else {
      setWatchlist([...watchlist, movie]);
    }
  };

  // 打开弹窗
  const handleOpenModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  // 关闭弹窗（selectedMovie 先保留，保证退场动画有数据）
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const displayedMovies = activeTab === 'watchlist' ? watchlist : movies;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* 顶部 Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {activeTab === 'popular' ? '🔥 热门影视' : '❤️ 我的追剧清单'}
            <span className="text-xs font-normal text-gray-500 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800">
              {displayedMovies.length} 部
            </span>
          </h2>
        </div>

        {/* 只在「我的追剧清单」页顶部显示流派分析图 */}
        {activeTab === 'watchlist' && <GenreChart watchlist={watchlist} />}

        {/* 加载中 → 骨架屏 / 出错 → 重试卡片 / 无数据 → 空提示 / 有数据 → 列表 */}
        {loading ? (
          <SkeletonGrid count={10} />
        ) : error ? (
          <div className="bg-gray-900 border border-red-900/30 rounded-2xl p-8 text-center max-w-md mx-auto my-12 space-y-4">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-lg font-bold text-white">加载失败</h3>
            <p className="text-xs text-gray-400">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              🔄 重新加载
            </button>
          </div>
        ) : displayedMovies.length === 0 ? (
          <p className="text-center text-gray-400 py-20">
            {activeTab === 'watchlist' ? '暂无收藏剧集，快去添加吧！' : '暂无数据'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isWatchlisted={watchlist.some((item) => item.id === movie.id)}
                onToggleWatchlist={handleToggleWatchlist}
                onOpen={() => handleOpenModal(movie)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 详情弹窗 */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isWatchlisted={selectedMovie ? watchlist.some((item) => item.id === selectedMovie.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );
}
