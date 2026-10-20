// SkeletonGrid 组件：骨架屏网格容器
import MovieSkeleton from './MovieSkeleton';

export default function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <MovieSkeleton key={index} />
      ))}
    </div>
  );
}
