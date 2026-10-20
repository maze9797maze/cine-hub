// GenreChart 组件：追剧清单的「观影偏好分析」环形图
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { GenreChartProps } from '../types';

// TMDB 流派 ID → 中文名称 映射表
// 用 Record<number, string | undefined> 表示「数字 id → 字符串（可能查不到返回 undefined）」
const GENRE_MAP: Record<number, string | undefined> = {
  28: '动作', 12: '冒险', 16: '动画', 35: '喜剧', 80: '犯罪',
  99: '纪录', 18: '剧情', 10751: '家庭', 14: '奇幻', 36: '历史',
  27: '恐怖', 10402: '音乐', 9648: '悬疑', 10749: '爱情', 878: '科幻',
  10770: '电视电影', 53: '惊悚', 10752: '战争', 37: '西部',
  10759: '动作冒险', 10765: '科幻奇幻'
};

// 配色：前 5 个是「极客暗黑风」主色，第 6 个灰色固定给「其他」
const COLORS = ['#e50914', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

export default function GenreChart({ watchlist = [] }: GenreChartProps) {
  // 空状态：清单里还没有东西
  if (watchlist.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 text-center text-gray-500 text-sm">
        📊 加入更多剧集，解锁你的观影偏好基因图谱
      </div>
    );
  }

  // 1. 统计每个流派出现的次数
  const genreCounts: Record<string, number> = {};
  let unknownCount = 0;
  watchlist.forEach((movie) => {
    const ids = movie.genre_ids || [];
    ids.forEach((id) => {
      const name = GENRE_MAP[id];
      if (name) {
        genreCounts[name] = (genreCounts[name] || 0) + 1;
      } else {
        unknownCount += 1;
      }
    });
  });

  // 2. 转成 Recharts 需要的格式 [{ name, value }]，按数量从高到低排序
  const sorted = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 3. 只留前 5 大流派，其余合并成一个「其他」
  const top5 = sorted.slice(0, 5);
  const restTotal =
    sorted.slice(5).reduce((sum, item) => sum + item.value, 0) + unknownCount;

  const chartData = [...top5];
  if (restTotal > 0) {
    chartData.push({ name: '其他', value: restTotal });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* 左侧：标题 + 说明 + 流派标签 */}
      <div className="space-y-2 text-center md:text-left">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 justify-center md:justify-start">
          📊 观影偏好分析
        </h3>
        <p className="text-xs text-gray-400">基于你已收藏的 {watchlist.length} 部剧集基因实时生成</p>

        {/* 流派标签组 */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-3">
          {chartData.map((entry, index) => (
            <span
              key={entry.name}
              className="text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium border border-white/5"
              style={{
                backgroundColor: `${COLORS[index % COLORS.length]}20`,
                color: COLORS[index % COLORS.length],
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              {entry.name}: {entry.value}
            </span>
          ))}
        </div>
      </div>

      {/* 右侧：环形图 */}
      <div className="w-full md:w-64 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#111827"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
