import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SparklineChart from '../components/ui/SparklineChart';

const sparkData = [40, 55, 48, 70, 62, 85, 80, 95, 88, 110];
const words = ['Smart', 'Money.', 'Clear', 'Future.'];

function NavBar() {
  const navigate = useNavigate();
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-8 py-5 shrink-0"
    >
      <div className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="8" width="11" height="11" rx="2" fill="#5046E4" transform="rotate(-15 2 8)" />
          <rect x="12" y="10" width="11" height="11" rx="2" fill="#7DB89A" opacity="0.85" transform="rotate(10 12 10)" />
        </svg>
        <span className="font-display font-bold text-xl tracking-tight text-dark">Flovex</span>
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/login')}
        className="btn-shimmer text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md"
      >
        Get Started
      </motion.button>
    </motion.nav>
  );
}

function HeroMockup() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 mesh-blob rounded-full scale-150 opacity-60" />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -left-4 bg-card border border-border rounded-xl px-3 py-2 shadow-card text-xs font-semibold text-sage flex items-center gap-1.5 z-10"
      >
        <span className="w-2 h-2 rounded-full bg-sage inline-block" />
        +₹2,351 today
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -top-2 right-0 bg-card border border-border rounded-xl px-3 py-2 shadow-card text-xs font-semibold text-indigo-flovex flex items-center gap-1.5 z-10"
      >
        ↑ 18.2% this month
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-2 -right-4 bg-card border border-border rounded-xl px-3 py-2 shadow-card text-xs font-semibold text-rose-flovex flex items-center gap-1.5 z-10"
      >
        Expenses ↓ 12%
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative bg-[#1A1A1F] rounded-2xl p-5 w-72 shadow-2xl z-10"
      >
        <p className="text-white/50 text-xs mb-1">Total Balance</p>
        <p className="text-white font-display font-bold text-2xl mb-3">₹56,874</p>
        <SparklineChart data={sparkData} color="#7DB89A" />
        <div className="flex gap-3 mt-3">
          <div className="flex-1 bg-white/5 rounded-xl p-2.5">
            <p className="text-white/40 text-xs">Income</p>
            <p className="text-sage font-bold text-sm">₹85,992</p>
          </div>
          <div className="flex-1 bg-white/5 rounded-xl p-2.5">
            <p className="text-white/40 text-xs">Expenses</p>
            <p className="text-rose-flovex font-bold text-sm">₹38,160</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <NavBar />

      <section className="flex-1 max-w-7xl w-full mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-indigo-flovex/10 text-indigo-flovex text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
          >
            <span>✦</span> AI-Powered Finance Tracking
          </motion.div>

          <h1 className="font-display font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            {words.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 280 }}
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted text-lg leading-relaxed mb-8 max-w-md"
          >
            Flovex gives you real-time visibility into your wealth — track every rupee, spot every pattern, and make decisions with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="btn-shimmer text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-glow"
            >
              Start Tracking <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>

        {/* Right mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <HeroMockup />
        </motion.div>
      </section>
    </div>
  );
}
