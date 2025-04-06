import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type ChartData = {
  name: string;
  value: number;
  fill?: string;
}[];

interface CandidatesChartProps {
  data: ChartData;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function CandidatesChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
}: CandidatesChartProps) {
  return (
    <div className="h-80 bg-white rounded-lg p-4">
      {title && <h3 className="text-base font-medium text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name"
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
          />
          <YAxis
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="value"
            name="Candidates"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
