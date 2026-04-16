'use client';

interface MiniBarProps {
  data: { label: string; count: number }[];
  color?: string;
  height?: number;
}

export default function MiniBar({ data, color = '#8b5cf6', height = 80 }: MiniBarProps) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.slice(0, 10).map((item, i) => {
        const pct = (item.count / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center flex-1 group" title={`${item.label}: ${item.count}`}>
            <div className="w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80"
              style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
          </div>
        );
      })}
    </div>
  );
}
