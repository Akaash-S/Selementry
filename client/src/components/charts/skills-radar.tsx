import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

interface SkillScore {
  skill: string;
  score: number;
}

interface SkillsRadarProps {
  data: SkillScore[];
}

export function SkillsRadar({ data }: SkillsRadarProps) {
  // Transform data to the format expected by Recharts
  const chartData = data.map(item => ({
    subject: item.skill,
    A: item.score,
    fullMark: 100
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={chartData} outerRadius="80%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 12 }} />
        <Radar 
          name="Skills" 
          dataKey="A" 
          stroke="hsl(var(--primary))" 
          fill="hsl(var(--primary))" 
          fillOpacity={0.5} 
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
