// MovieSkeleton 组件：骨架屏卡片（真实数据返回前的「占位假卡片」）
// 用 animate-pulse 做出灰色块的一明一暗「呼吸」闪烁

export default function MovieSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex flex-col animate-pulse">
      {/* 1. 海报占位块 */}
      <div className="aspect-[2/3] bg-gray-800 w-full" />

      {/* 2. 文字区占位 */}
      <div className="p-4 flex flex-col justify-between gap-3 flex-1">
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded-md w-3/4" />
          <div className="h-3 bg-gray-800/60 rounded-md w-1/3" />
        </div>

        <div className="h-8 bg-gray-800/80 rounded-lg w-full" />
      </div>
    </div>
  );
}
