import { useState, useEffect } from 'react';
import Header from './components/Header';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import GenreChart from './components/GenreChart';
import { fetchPopular, searchMovies } from './api';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  // 状态：
  //   activeTab    ：当前选中的 Tab（'popular' 或 'watchlist'）
  //   searchQuery  ：搜索框里的文字
  //   watchlist    ：追剧清单（收藏的电影数组）
  //   movies       ：当前显示的电影列表（来自 TMDB API）
  //   loading      ：是否正在加载
  //   error        ：错误信息（没有错误时为 null）
  //   selectedMovie：当前点开的电影数据（控制弹窗里显示什么）
  //   isModalOpen  ：弹窗是否打开（true/false）
  const [activeTab, setActiveTab] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useLocalStorage('cinehub_watchlist', []);   // 持久化：数据会自动存进 localStorage
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 加载热门影视
  const loadPopularMovies = async () => {
    try {
      setLoading(true);                        // 开始加载，显示「加载中」
      setError(null);                          // 清空之前的错误
      const data = await fetchPopular();       // 请求 TMDB 热门数据
      setMovies(data);                         // 存进 movies 状态
    } catch (err) {
      setError('无法获取影视数据，请检查 API Key 或网络');
    } finally {
      setLoading(false);                       // 无论成功失败，都结束加载
    }
  };

  // useEffect：组件「首次渲染完成」后自动执行一次
  // 第二个参数是空数组 []，表示「只在页面第一次加载时跑一次」
  useEffect(() => {
    loadPopularMovies();
  }, []);

  // 处理搜索：搜索词为空 → 重置为热门；否则搜索
  const handleSearch = async () => {
    const query = searchQuery.trim();          // 去掉首尾空格
    if (!query) {
      loadPopularMovies();                     // 空搜索词 → 回到热门推荐
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

  // 收藏切换：点卡片上的收藏按钮时触发
  const handleToggleWatchlist = (movie) => {
    const exists = watchlist.some((item) => item.id === movie.id);
    if (exists) {
      setWatchlist(watchlist.filter((item) => item.id !== movie.id));
    } else {
      setWatchlist([...watchlist, movie]);
    }
  };

  // 打开弹窗：记住点的是哪部电影，并把弹窗设为「打开」
  const handleOpenModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  // 关闭弹窗：只把 isModalOpen 改成 false。
  // 注意：selectedMovie 先保留着（不清空），
  // 这样 Framer Motion 的退场动画还有数据可以显示，动画播完再自动移除。
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 根据当前 Tab 决定显示哪些：
  //   'watchlist' → 显示收藏清单；否则 → 显示 movies（热门/搜索结果）
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

        {/* 三种状态：加载中 / 出错 / 无数据，最后才是列表 */}
        {loading ? (
          <p className="text-center text-gray-400 py-20">⏳ 加载中...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-20">{error}</p>
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

      {/* 详情弹窗：点击卡片后显示。
          movie 传 selectedMovie（当前点开的电影），
          isOpen 传 isModalOpen（是否打开），
          onClose 传 handleCloseModal（关闭）。 */}
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
