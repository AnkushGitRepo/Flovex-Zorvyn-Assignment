import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye } from 'lucide-react';
import { useRole } from '../hooks/useRole';

const roles = [
  {
    key: 'admin',
    icon: ShieldCheck,
    title: 'Admin Access',
    desc: 'Full control — add, edit, and manage transactions with complete dashboard access.',
    iconColor: 'text-indigo-flovex',
    iconBg: 'bg-indigo-flovex/10',
    border: 'border-indigo-flovex/30',
    glow: 'hover:shadow-[0_0_28px_4px_rgba(80,70,228,0.18)]',
    badge: 'bg-indigo-flovex/15 text-indigo-flovex',
  },
  {
    key: 'viewer',
    icon: Eye,
    title: 'Viewer Mode',
    desc: 'Read-only access — explore all data and insights without editing anything.',
    iconColor: 'text-sage',
    iconBg: 'bg-sage/10',
    border: 'border-sage/30',
    glow: 'hover:shadow-[0_0_28px_4px_rgba(125,184,154,0.18)]',
    badge: 'bg-sage/15 text-sage',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.15, type: 'spring', stiffness: 260, damping: 22 },
  }),
};

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const handleSelect = (roleKey) => {
    setRole(roleKey);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1F] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-flovex/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-10"
      >
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="8" width="11" height="11" rx="2" fill="#5046E4" transform="rotate(-15 2 8)" />
          <rect x="12" y="10" width="11" height="11" rx="2" fill="#7DB89A" opacity="0.85" transform="rotate(10 12 10)" />
        </svg>
        <span className="font-display font-bold text-2xl text-white tracking-tight">Flovex</span>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center mb-10"
      >
        <h1 className="font-display font-bold text-white text-3xl md:text-4xl mb-2">
          How are you signing in today?
        </h1>
        <p className="text-white/40 text-base">No passwords. No friction. Just pick your role.</p>
      </motion.div>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {roles.map((role, i) => (
          <motion.button
            key={role.key}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(role.key)}
            className={`flex-1 bg-slate-flovex border ${role.border} rounded-2xl p-7 text-left transition-all duration-300 ${role.glow} cursor-pointer group`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${role.iconBg} ${role.iconColor} group-hover:scale-110 transition-transform`}>
              <role.icon size={28} />
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.badge} mb-3 inline-block`}>
              {role.key === 'admin' ? 'Admin' : 'Viewer'}
            </span>
            <h3 className="font-display font-bold text-white text-xl mb-2">{role.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{role.desc}</p>

            <div className={`mt-6 flex items-center gap-1.5 text-sm font-semibold ${role.iconColor}`}>
              Enter as {role.title.split(' ')[0]} →
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-white/20 text-xs mt-8"
      >
        Your role can be changed anytime from Settings.
      </motion.p>
    </div>
  );
}
