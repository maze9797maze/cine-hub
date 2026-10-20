// SearchBar 组件：搜索栏（一个可复用的「零件」）
import type { FormEvent } from 'react';
import type { SearchBarProps } from '../types';

export default function SearchBar({ searchQuery, setSearchQuery, onSearch }: SearchBarProps) {
  // 表单提交时触发（按回车 或 点🔍按钮都会触发）
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();   // 阻止 form 默认的「提交后刷新页面」行为
    onSearch();           // 执行父组件传来的搜索逻辑
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md w-full">
      {/* 受控组件：value 绑定 searchQuery，onChange 在用户每敲一个字时更新它 */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索电影或电视剧..."
        className="w-full bg-gray-800 text-white pl-4 pr-10 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-red-600 transition-colors text-sm"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
      >
        🔍
      </button>
    </form>
  );
}
