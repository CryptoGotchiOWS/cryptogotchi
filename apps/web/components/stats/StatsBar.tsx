"use client";

interface StatsBarProps {
  label: string;
  value: number;
  icon: string;
}

export default function StatsBar({ label, value, icon }: StatsBarProps) {
  const color =
    value > 60
      ? "bg-success"
      : value > 30
        ? "bg-warning"
        : "bg-danger";

  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-5 text-center" role="img" aria-label={label}>
        {icon}
      </span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <span className="font-pixel text-[7px] text-dark-gray">{label}</span>
          <span className="font-mono text-[10px] text-charcoal">{Math.round(value)}%</span>
        </div>
        <div className="h-2 bg-sage-mist rounded-full overflow-hidden">
          <div
            role="progressbar"
            aria-valuenow={Math.round(value)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} ${Math.round(value)}%`}
            className={`h-full rounded-full stat-bar-fill ${color}`}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
