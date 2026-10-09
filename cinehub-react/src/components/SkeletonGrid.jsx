// SkeletonGrid 组件：骨架屏网格容器
// 生成 count 个 MovieSkeleton，排成和真实列表一样的响应式网格

import MovieSkeleton from './MovieSkeleton';

export default function SkeletonGrid({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {/* Array.from({ length: count }) 生成一个长度为 count 的空数组，用来循环渲染 */}
      {Array.from({ length: count }).map((_, index) => (
        <MovieSkeleton key={index} />
      ))}
    </div>
  );
}
