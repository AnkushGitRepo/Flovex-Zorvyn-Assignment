const COLORS = ['#5046E4', '#7DB89A', '#E8B84B', '#E86B6B', '#4ECDC4', '#F5A623', '#9B9BAD'];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function Avatar({ name = '?', size = 36 }) {
  const bg = getColor(name);
  return (
    <div
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none"
    >
      {getInitials(name)}
    </div>
  );
}
