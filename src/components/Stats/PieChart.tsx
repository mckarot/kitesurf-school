// src/components/Stats/PieChart.tsx

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  title?: string;
  size?: number;
  showLegend?: boolean;
  showValues?: boolean;
}

export function PieChart({
  data,
  title,
  size = 200,
  showLegend = true,
  showValues = true,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>}
        <div className="flex items-center justify-center" style={{ height: size }}>
          <p className="text-gray-500">Aucune donnée</p>
        </div>
      </div>
    );
  }

  let currentAngle = 0;
  const segments: JSX.Element[] = [];
  const center = size / 2;
  const radius = size / 2 - 10;

  data.forEach((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Calculate arc path
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    segments.push(
      <path
        key={item.label}
        d={pathData}
        fill={item.color}
        className="transition-opacity hover:opacity-80"
      >
        <title>{`${item.label}: ${Math.round(percentage * 100)}% (${item.value})`}</title>
      </path>
    );

    currentAngle = endAngle;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>}

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Pie chart */}
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments}
            {/* Center circle for donut effect */}
            <circle
              cx={center}
              cy={center}
              r={radius * 0.5}
              fill="white"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-2">
            {data.map((item) => {
              const percentage = Math.round((item.value / total) * 100);
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                  {showValues && (
                    <span className="text-sm font-medium text-gray-900">
                      {item.value} ({percentage}%)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
