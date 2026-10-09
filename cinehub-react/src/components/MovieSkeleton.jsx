// MovieSkeleton 组件：骨架屏卡片（真实数据返回前的「占位假卡片」）
// 用 animate-pulse 做出灰色块的一明一暗「呼吸」闪烁，
// 结构上 1:1 模拟 MovieCard，让用户提前看到布局，感觉加载更快

export default function MovieSkeleton() {
  return (
    // 外层和 MovieCard 一样的圆角 / 边框 / 深色，只是多加了 animate-pulse
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex flex-col animate-pulse">
      {/* 1. 海报占位块：aspect-[2/3] 保持和真实海报一样的宽高比 */}
      <div className="aspect-[2/3] bg-gray-800 w-full" />

      {/* 2. 文字区占位 */}
      <div className="p-4 flex flex-col justify-between gap-3 flex-1">
        <div className="space-y-2">
          {/* 标题占位条（较宽） */}
          <div className="h-4 bg-gray-800 rounded-md w-3/4" />
          {/* 年份占位条（较窄） */}
          <div className="h-3 bg-gray-800/60 rounded-md w-1/3" />
        </div>

        {/* 按钮占位块 */}
        <div className="h-8 bg-gray-800/80 rounded-lg w-full" />
      </div>
    </div>
  );
}
