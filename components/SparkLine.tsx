'use client';

interface SparkLineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
}

export default function SparkLine({ data, color = '#3b82f6', height = 40, width = 120, fill = true }: SparkLineProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="flex items-end justify-center opacity-20 text-xs text-slate-500">no data</div>;
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pad = 2;
  const w = width;
  const h = height;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const lastPt = points[points.length - 1].split(',');

  // Area fill path
  const areaPath = `M${points[0]} L${points.join(' L')} L${lastPt[0]},${h - pad} L${pad},${h - pad} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
    </svg>
  );
}
