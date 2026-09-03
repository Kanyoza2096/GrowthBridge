import React from 'react';
import { cn } from '@/lib/utils';
import { ChartDataPoint } from '@/lib/types/admin';

// ---------------------------------------------------------------------------
// SVG Chart Colors — reads from CSS custom properties so charts adapt to theme
// ---------------------------------------------------------------------------
const CHART_GRID = 'var(--border-subtle)';
const CHART_LABEL = 'var(--text-tertiary)';
const CHART_VALUE = 'var(--text-secondary)';
const CHART_CENTER_TEXT = 'var(--text-primary)';
const CHART_TRACK = 'var(--surface-subtle)';

// ---------------------------------------------------------------------------
// LineChart
// ---------------------------------------------------------------------------
interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  gradientId?: string;
  className?: string;
  showArea?: boolean;
}

export function LineChart({
  data,
  height = 180,
  color = 'var(--gb-green-600)',
  gradientId = 'line-grad',
  className,
  showArea = true,
}: LineChartProps) {
  if (data.length === 0) return null;

  const width = 600;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxV = Math.max(...data.map((d) => d.value));
  const minV = Math.min(...data.map((d) => d.value));
  const range = maxV - minV || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.value - minV) / range) * chartH;
    return { x, y, value: d.value, label: d.label };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD =
    pathD +
    ` L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('w-full h-auto', className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Line chart"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padding.top + chartH * (1 - t);
        const v = Math.round(minV + range * t);
        return (
          <g key={t}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={CHART_GRID}
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={y + 3}
              fontSize="9"
              fill={CHART_LABEL}
              textAnchor="end"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      {showArea && <path d={areaD} fill={`url(#${gradientId})`} />}

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points & labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill={color}
            stroke="var(--surface-page)"
            strokeWidth="2"
          />
          <text
            x={p.x}
            y={height - 10}
            fontSize="9"
            fill={CHART_LABEL}
            textAnchor="middle"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BarChart
// ---------------------------------------------------------------------------
interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  accentColor?: string;
  className?: string;
}

export function BarChart({
  data,
  height = 180,
  color = 'var(--gb-navy-700)',
  accentColor = 'var(--gb-green-600)',
  className,
}: BarChartProps) {
  if (data.length === 0) return null;

  const width = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxV = Math.max(...data.map((d) => d.value));

  const barWidth = (chartW / data.length) * 0.65;
  const gap = (chartW / data.length) * 0.35;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('w-full h-auto', className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Bar chart"
    >
      {/* Grid lines */}
      {[0, 0.5, 1].map((t) => {
        const y = padding.top + chartH * (1 - t);
        const v = Math.round(maxV * t);
        return (
          <g key={t}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={CHART_GRID}
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={y + 3}
              fontSize="9"
              fill={CHART_LABEL}
              textAnchor="end"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const h = (d.value / maxV) * chartH;
        const x = padding.left + i * (barWidth + gap) + gap / 2;
        const y = padding.top + chartH - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx="4"
              fill={color}
              opacity="0.85"
            />
            {/* Accent top */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height="3"
              rx="1.5"
              fill={accentColor}
            />
            {/* Label */}
            <text
              x={x + barWidth / 2}
              y={height - 18}
              fontSize="9"
              fill={CHART_LABEL}
              textAnchor="middle"
            >
              {d.label}
            </text>
            {/* Value */}
            <text
              x={x + barWidth / 2}
              y={y - 5}
              fontSize="10"
              fill={CHART_VALUE}
              textAnchor="middle"
              fontWeight="bold"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DonutChart
// ---------------------------------------------------------------------------
interface DonutChartProps {
  data: ChartDataPoint[];
  size?: number;
  thickness?: number;
  className?: string;
  colors?: string[];
}

const DONUT_COLORS = [
  'var(--gb-green-600)',
  'var(--gb-navy-700)',
  'var(--gb-orange-500)',
  '#a855f7',
  '#38bdf8',
  '#ef4444',
];

export function DonutChart({
  data,
  size = 180,
  thickness = 24,
  className,
  colors = DONUT_COLORS,
}: DonutChartProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circ = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Donut chart"
      >
        {/* Track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={CHART_TRACK}
          strokeWidth={thickness}
        />

        {/* Segments */}
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const gap = circ - dash;
          const segmentColor = colors[i % colors.length];

          const el = (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segmentColor}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${center} ${center})`}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}

        {/* Center text */}
        <text
          x={center}
          y={center - 2}
          fontSize="22"
          fontWeight="800"
          fill={CHART_CENTER_TEXT}
          textAnchor="middle"
        >
          {total}
        </text>
        <text
          x={center}
          y={center + 16}
          fontSize="10"
          fill={CHART_LABEL}
          textAnchor="middle"
        >
          Total
        </text>
      </svg>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: colors[i % colors.length] }}
                />
                <span className="text-xs text-[var(--text-secondary)] truncate">
                  {d.label}
                </span>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)] flex-shrink-0">
                {d.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
