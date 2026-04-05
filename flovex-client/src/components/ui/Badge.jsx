const variants = {
  completed: 'bg-sage/15 text-sage',
  pending:   'bg-amber-flovex/15 text-amber-flovex',
  chargeback:'bg-rose-flovex/15 text-rose-flovex',
  income:    'bg-sage/15 text-sage',
  expense:   'bg-rose-flovex/15 text-rose-flovex',
  admin:     'bg-indigo-flovex/15 text-indigo-flovex',
  viewer:    'bg-sage/15 text-sage',
  active:    'bg-sage/15 text-sage',
  paused:    'bg-amber-flovex/15 text-amber-flovex',
  cancelled: 'bg-rose-flovex/15 text-rose-flovex',
  default:   'bg-muted/15 text-muted',
};

export default function Badge({ label, variant = 'default', className = '' }) {
  const cls = variants[variant] || variants.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls} ${className}`}>
      {label}
    </span>
  );
}
