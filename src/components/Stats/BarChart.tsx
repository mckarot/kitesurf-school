// src/components/Stats/BarChart.tsx

interface BarChartProps {
  data: { label: string; value: number }[];
  title?: string;
  color?: string;
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
}

export function BarChart({
  data,
  title,
  color = '#3b82f6',
  height = 200,
  showValues = true,
  formatValue = (v) => v.toString(),
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;
  const gap = barWidth * 0.2;
  const actualBarWidth = barWidth - gap;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      )}

      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(Math.round(maxValue / 2))}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-14 h-full pb-8">
          {/* Grid lines */}
          <div className="absolute left-14 right-0 top-0 bottom-8">
            <div className="absolute top-0 left-0 right-0 border-t border-gray-100" />
            <div className="absolute top-1/2 left-0 right-0 border-t border-gray-100" />
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100" />
          </div>

          {/* Bars */}
          <div className="relative h-full flex items-end gap-1">
            {data.map((item, index) => {
              const barHeight = (item.value / maxValue) * 100;
              return (
                <div
                  key={item.label}
                  className="flex-1 flex flex-col items-center"
                  style={{ maxWidth: `${barWidth}%` }}
                >
                  {/* Value label */}
                  {showValues && item.value > 0 && (
                    <span className="text-xs font-medium text-gray-600 mb-1">
                      {formatValue(item.value)}
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: color,
                      minHeight: item.value > 0 ? '4px' : '0',
                    }}
                    title={`${item.label}: ${formatValue(item.value)}`}
                  />

                  {/* Label */}
                  <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
