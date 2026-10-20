// Header 组件：顶部导航栏（品牌 Logo + 搜索框 + Tab 切换）
import SearchBar from './SearchBar';
import type { HeaderProps } from '../types';

export default function Header({ activeTab, setActiveTab, searchQuery, setSearchQuery, onSearch }: HeaderProps) {
  return (
    <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-gray-800">
      {/* 品牌 Logo */}
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold text-red-600 tracking-wider">🎬 CineHub</h1>
        <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800 font-mono">v2.0 React</span>
      </div>

      {/* 搜索框组件 */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={onSearch}
      />

      {/* Tab 导航切换 */}
      <div className="flex gap-2 bg-gray-900 p-1 rounded-full border border-gray-800">
        <button
          onClick={() => setActiveTab('popular')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'popular' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          🔥 热门推荐
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'watchlist' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          ❤️ 我的追剧清单
        </button>
      </div>
    </header>
  );
}
