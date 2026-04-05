import { ResponsiveContainer, LineChart, Line } from 'recharts';

export default function SparklineChart({ data = [], color = '#5046E4' }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={points}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
