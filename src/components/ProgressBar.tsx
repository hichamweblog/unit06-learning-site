export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const safeMax = Math.max(0, max);
  const safeValue = Math.min(safeMax, Math.max(0, value));
  const percent = safeMax === 0 ? 0 : Math.round((safeValue / safeMax) * 100);
  return (
    <div className="progress-meter">
      <div className="progress-meter__labels"><span>{label}</span><span><bdi>{safeValue}</bdi> / <bdi>{safeMax}</bdi></span></div>
      <div className="progress-meter__track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={safeValue}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
