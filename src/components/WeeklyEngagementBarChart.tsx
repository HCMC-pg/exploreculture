import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  ReferenceLine
} from 'recharts';
import { DayStudyRecord } from '../types';
import { BookOpen, Compass, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface WeeklyEngagementBarChartProps {
  weeklyRecords: DayStudyRecord[];
  dailyGoalMinutes: number;
}

type ViewMode = 'both' | 'study' | 'explore';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomEngagementTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-stone-900/95 border border-amber-500/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs min-w-[200px] space-y-2 z-50">
        <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
          <span className="font-bold text-amber-300 text-sm">{data.fullDay}</span>
          <span className="text-[10px] text-stone-400 font-mono">{data.date}</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
              Nghiên cứu sử liệu:
            </span>
            <span className="font-bold font-mono text-stone-100">
              {data.studyHours}h <span className="text-stone-400 font-normal">({data.studyMinutes}p)</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block"></span>
              Thám hiểm di sản:
            </span>
            <span className="font-bold font-mono text-stone-100">
              {data.explorationHours}h <span className="text-stone-400 font-normal">({data.explorationMinutes}p)</span>
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-stone-300">
            <span className="font-semibold">Tổng tương tác:</span>
            <span className="font-bold font-mono text-amber-200 text-xs">
              {data.totalHours} giờ
            </span>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between text-[10px]">
          <span className="text-stone-400">Nhiệm vụ & câu hỏi:</span>
          <span className="font-bold text-emerald-400">{data.questionsCount} câu</span>
        </div>

        {data.completedGoal ? (
          <div className="pt-1 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            Đạt chỉ tiêu học tập ngày!
          </div>
        ) : (
          <div className="pt-1 text-[10px] text-stone-500">
            Chưa đạt chỉ tiêu ngày
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const WeeklyEngagementBarChart: React.FC<WeeklyEngagementBarChartProps> = ({
  weeklyRecords,
  dailyGoalMinutes
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const dayNamesMap: Record<string, string> = {
    'T2': 'Thứ Hai',
    'T3': 'Thứ Ba',
    'T4': 'Thứ Tư',
    'T5': 'Thứ Năm',
    'T6': 'Thứ Sáu',
    'T7': 'Thứ Bảy',
    'CN': 'Chủ Nhật'
  };

  const chartData = useMemo(() => {
    return weeklyRecords.map((rec) => {
      const studyMins = rec.minutes || 0;
      const exploreMins = Math.max(12, (rec.questionsCount || 0) * 10 + (rec.completedGoal ? 20 : 8));
      const studyHrs = Number((studyMins / 60).toFixed(2));
      const exploreHrs = Number((exploreMins / 60).toFixed(2));
      const totalHrs = Number(((studyMins + exploreMins) / 60).toFixed(2));

      return {
        day: rec.day,
        fullDay: dayNamesMap[rec.day] || rec.day,
        date: rec.date || '',
        studyHours: studyHrs,
        studyMinutes: studyMins,
        explorationHours: exploreHrs,
        explorationMinutes: exploreMins,
        totalHours: totalHrs,
        questionsCount: rec.questionsCount || 0,
        completedGoal: rec.completedGoal || false
      };
    });
  }, [weeklyRecords]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let totalStudyH = 0;
    let totalExploreH = 0;
    let peakDay = chartData[0];

    chartData.forEach(item => {
      totalStudyH += item.studyHours;
      totalExploreH += item.explorationHours;
      if (!peakDay || item.totalHours > peakDay.totalHours) {
        peakDay = item;
      }
    });

    const totalH = totalStudyH + totalExploreH;
    const avgMins = Math.round((totalH * 60) / (chartData.length || 7));
    const goalCompletedDays = chartData.filter(d => d.completedGoal).length;

    return {
      totalHours: totalH.toFixed(1),
      studyHours: totalStudyH.toFixed(1),
      explorationHours: totalExploreH.toFixed(1),
      avgMinsPerDay: avgMins,
      peakDayName: peakDay ? peakDay.fullDay : 'Thứ 7',
      peakDayHours: peakDay ? peakDay.totalHours : 0,
      goalRate: Math.round((goalCompletedDays / (chartData.length || 7)) * 100)
    };
  }, [chartData]);

  const goalHoursThreshold = Number((dailyGoalMinutes / 60).toFixed(2));

  return (
    <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-3.5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-stone-800/80">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-amber-200">
              Biểu Đồ Thời Lượng Nghiên Cứu & Thám Hiểm Di Sản
            </h4>
          </div>
          <p className="text-[11px] text-stone-400">
            Thống kê thời gian thực 7 ngày gần nhất (tính theo Giờ)
          </p>
        </div>

        {/* View mode toggle button pills */}
        <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setViewMode('both');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              viewMode === 'both'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setViewMode('study');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'study'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-2.5 h-2.5" />
            Nghiên cứu
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setViewMode('explore');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 ${
              viewMode === 'explore'
                ? 'bg-cyan-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-2.5 h-2.5" />
            Thám hiểm
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
          <span className="text-[10px] text-stone-400 block">Tổng Giờ Trong Tuần</span>
          <span className="text-base font-bold font-mono text-amber-300">{stats.totalHours} giờ</span>
          <span className="text-[10px] text-stone-500 block">+{stats.avgMinsPerDay}p / ngày</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
          <span className="text-[10px] text-amber-400/90 block">Giờ Đọc Sử Liệu</span>
          <span className="text-base font-bold font-mono text-amber-400">{stats.studyHours} giờ</span>
          <span className="text-[10px] text-stone-500 block">Nghiên cứu văn bản</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
          <span className="text-[10px] text-cyan-400/90 block">Giờ Thám Hiểm 3D</span>
          <span className="text-base font-bold font-mono text-cyan-400">{stats.explorationHours} giờ</span>
          <span className="text-[10px] text-stone-500 block">Khảo sát & giải mật</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
          <span className="text-[10px] text-emerald-400/90 block flex items-center gap-1">
            <Trophy className="w-3 h-3 text-emerald-400" />
            Ngày Tích Cực Nhất
          </span>
          <span className="text-base font-bold font-mono text-emerald-300 truncate block">
            {stats.peakDayName}
          </span>
          <span className="text-[10px] text-stone-400 block">{stats.peakDayHours} giờ thám hiểm</span>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="w-full h-56 pt-2 select-none">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={chartData} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#a8a29e" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#44403c' }}
            />
            <YAxis 
              stroke="#a8a29e" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#44403c' }}
              unit="h" 
            />
            <Tooltip content={<CustomEngagementTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={28}
              formatter={(value) => <span className="text-[11px] text-stone-300 font-medium">{value}</span>}
            />
            
            {/* Daily Goal Reference Line */}
            {goalHoursThreshold > 0 && (
              <ReferenceLine 
                y={goalHoursThreshold} 
                stroke="#eab308" 
                strokeDasharray="4 4" 
                label={{ 
                  value: `Mục tiêu (${goalHoursThreshold}h)`, 
                  fill: '#eab308', 
                  fontSize: 10, 
                  position: 'right' 
                }} 
              />
            )}

            {(viewMode === 'both' || viewMode === 'study') && (
              <Bar 
                dataKey="studyHours" 
                name="Giờ Nghiên Cứu Sử Liệu" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            )}

            {(viewMode === 'both' || viewMode === 'explore') && (
              <Bar 
                dataKey="explorationHours" 
                name="Giờ Thám Hiểm Di Sản 3D" 
                fill="#06b6d4" 
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Legend & Explanation */}
      <div className="pt-2 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
            Nghiên cứu sử liệu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block"></span>
            Khám phá 3D & Nhiệm vụ
          </span>
        </div>
        <div className="text-stone-500 text-[10px]">
          Di chuột hoặc chạm vào cột để xem chi tiết số phút và câu hỏi đã giải.
        </div>
      </div>
    </div>
  );
};
