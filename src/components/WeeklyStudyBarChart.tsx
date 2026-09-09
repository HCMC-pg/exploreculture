import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { Clock, Calendar, Target, Award, Sparkles, TrendingUp, Info } from 'lucide-react';
import { DayStudyRecord, LearningHabits } from '../types';

interface WeeklyStudyBarChartProps {
  weeklyRecords: DayStudyRecord[];
  dailyGoalMinutes: number;
  learningHabits?: LearningHabits;
  totalStudyHours?: number;
  totalStudyMinutes?: number;
}

interface ChartDataPoint {
  day: string;
  date: string;
  minutes: number;
  hours: number;
  displayHours: string;
  questionsCount: number;
  completedGoal: boolean;
  targetMinutes: number;
  targetHours: number;
}

export const WeeklyStudyBarChart: React.FC<WeeklyStudyBarChartProps> = ({
  weeklyRecords,
  dailyGoalMinutes,
  learningHabits,
  totalStudyHours = 0,
  totalStudyMinutes = 0
}) => {
  const [metricMode, setMetricMode] = useState<'hours' | 'questions'>('hours');
  const [focusedBar, setFocusedBar] = useState<ChartDataPoint | null>(null);

  // Transform records for Recharts
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!weeklyRecords || weeklyRecords.length === 0) {
      // Fallback default 7 days
      const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      return days.map((d, idx) => ({
        day: d,
        date: `2026-09-0${idx + 1}`,
        minutes: 20 + (idx * 5) % 25,
        hours: Number(((20 + (idx * 5) % 25) / 60).toFixed(2)),
        displayHours: ((20 + (idx * 5) % 25) / 60).toFixed(1),
        questionsCount: 3 + (idx % 4),
        completedGoal: (20 + (idx * 5) % 25) >= dailyGoalMinutes,
        targetMinutes: dailyGoalMinutes,
        targetHours: Number((dailyGoalMinutes / 60).toFixed(2))
      }));
    }

    return weeklyRecords.map((rec) => {
      const mins = rec.minutes || 0;
      const hrs = Number((mins / 60).toFixed(2));
      return {
        day: rec.day,
        date: rec.date,
        minutes: mins,
        hours: hrs,
        displayHours: (mins / 60).toFixed(1),
        questionsCount: rec.questionsCount || 0,
        completedGoal: mins >= dailyGoalMinutes,
        targetMinutes: dailyGoalMinutes,
        targetHours: Number((dailyGoalMinutes / 60).toFixed(2))
      };
    });
  }, [weeklyRecords, dailyGoalMinutes]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const totalMins = chartData.reduce((acc, curr) => acc + curr.minutes, 0);
    const totalHours = (totalMins / 60).toFixed(1);
    const totalQuestions = chartData.reduce((acc, curr) => acc + curr.questionsCount, 0);
    const avgMinutesPerDay = Math.round(totalMins / (chartData.length || 7));
    const goalsMetCount = chartData.filter(d => d.completedGoal).length;
    const peakDay = [...chartData].sort((a, b) => b.minutes - a.minutes)[0] || chartData[0];

    return {
      totalMins,
      totalHours,
      totalQuestions,
      avgMinutesPerDay,
      goalsMetCount,
      peakDay
    };
  }, [chartData]);

  // Target goal in hours for ReferenceLine
  const targetGoalHours = Number((dailyGoalMinutes / 60).toFixed(2));

  // Custom Dark/Amber Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDataPoint = payload[0].payload;
      return (
        <div className="bg-stone-950/95 border border-amber-500/60 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px] z-50">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {data.day} ({data.date})
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              data.completedGoal 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-stone-800 text-stone-400'
            }`}>
              {data.completedGoal ? 'Đạt Mục Tiêu' : 'Chưa Đạt'}
            </span>
          </div>

          <div className="space-y-1 text-stone-300 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Thời gian học tập:</span>
              <span className="font-bold text-amber-200">
                {Math.floor(data.minutes / 60)}h {data.minutes % 60}p ({data.displayHours} giờ)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Câu đố & Mật thư:</span>
              <span className="font-bold text-cyan-300">{data.questionsCount} câu</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5 border-t border-stone-850">
              <span>Mục tiêu ngày:</span>
              <span>{dailyGoalMinutes} phút/ngày</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/40 space-y-3.5 shadow-lg">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-amber-200 text-sm">
              Biểu Đồ Tương Tác & Thời Lượng Học Tập Tuần
            </h4>
          </div>
          <p className="text-[11px] text-stone-400">
            Trực quan hóa mức độ tương tác và khám phá di sản 7 ngày gần nhất qua thư viện Recharts
          </p>
        </div>

        {/* Metric Toggle */}
        <div className="inline-flex rounded-xl bg-stone-900 p-0.5 border border-stone-800 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode('hours')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              metricMode === 'hours'
                ? 'bg-amber-500 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Số Giờ (h)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('questions')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              metricMode === 'questions'
                ? 'bg-amber-500 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Mật Thư (Câu)
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Tổng Giờ Trong Tuần</p>
          <p className="text-base font-extrabold font-mono text-amber-300">{stats.totalHours} <span className="text-xs font-normal text-stone-400">giờ</span></p>
          <p className="text-[10px] text-stone-500">({stats.totalMins} phút)</p>
        </div>

        <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Trung Bình / Ngày</p>
          <p className="text-base font-extrabold font-mono text-cyan-300">{stats.avgMinutesPerDay} <span className="text-xs font-normal text-stone-400">phút</span></p>
          <p className="text-[10px] text-stone-500">Mục tiêu: {dailyGoalMinutes}p</p>
        </div>

        <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Ngày Đỉnh Cao</p>
          <p className="text-base font-extrabold text-emerald-300">{stats.peakDay?.day || 'T7'}</p>
          <p className="text-[10px] text-emerald-400 font-mono">{stats.peakDay?.minutes || 0} phút ({stats.peakDay?.displayHours}h)</p>
        </div>

        <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Đạt Chỉ Tiêu</p>
          <p className="text-base font-extrabold font-mono text-amber-400">{stats.goalsMetCount}/7 <span className="text-xs font-normal text-stone-400">ngày</span></p>
          <p className="text-[10px] text-stone-500">Chuỗi tích lũy LP</p>
        </div>
      </div>

      {/* Main Recharts BarChart Canvas */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 10, left: -20, bottom: 5 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                setFocusedBar(state.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setFocusedBar(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#a8a29e', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#44403c' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#78716c', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              unit={metricMode === 'hours' ? 'h' : 'c'}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }} />
            
            {metricMode === 'hours' && (
              <ReferenceLine 
                y={targetGoalHours} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: `Mục tiêu: ${targetGoalHours}h`, 
                  position: 'insideTopRight', 
                  fill: '#10b981', 
                  fontSize: 10,
                  fontWeight: 'bold' 
                }} 
              />
            )}

            <Bar 
              dataKey={metricMode === 'hours' ? 'hours' : 'questionsCount'} 
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            >
              {chartData.map((entry, index) => {
                const isGoalMet = entry.completedGoal;
                // Highlight color depending on metric & goal achievement
                let fillColor = isGoalMet ? '#f59e0b' : '#78716c';
                if (metricMode === 'questions') {
                  fillColor = entry.questionsCount >= 4 ? '#06b6d4' : '#64748b';
                }
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fillColor}
                    opacity={focusedBar && focusedBar.day === entry.day ? 1 : 0.88}
                    stroke={isGoalMet ? '#fde68a' : 'transparent'}
                    strokeWidth={isGoalMet ? 1 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Guide Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-850 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block border border-amber-300" />
            <span>Đạt mục tiêu ngày ({dailyGoalMinutes}p+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-stone-600 inline-block" />
            <span>Dưới mục tiêu</span>
          </div>
        </div>

        <span className="text-[10px] text-amber-400/90 italic flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Rê chuột lên từng cột để xem chi tiết giờ học & câu đố
        </span>
      </div>
    </div>
  );
};
