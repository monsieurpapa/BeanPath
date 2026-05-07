import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const weeklyData = [
  { week: 'W28', cherry: 480, parch: 96, grade: 'AA' },
  { week: 'W29', cherry: 750, parch: 150, grade: 'A' },
  { week: 'W30', cherry: 620, parch: 124, grade: 'AA' },
  { week: 'W31', cherry: 390, parch: 78, grade: 'B' },
];

const lotStatus = [
  { lot: 'Lot #5251', stage: 'shipped', progress: 100, color: '#15803d' },
  { lot: 'Lot #5252', stage: 'graded', progress: 78, color: '#b45309' },
  { lot: 'Lot #5253', stage: 'drying', progress: 45, color: '#b45309' },
  { lot: 'Lot #14002', stage: 'in_transit', progress: 90, color: '#15803d' },
];

const cupScore = 86.5;
const maxScore = 100;

export function Scene4() {
  const [phase, setPhase] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (phase < 3) return;
    let start = 0;
    const target = cupScore;
    const step = () => {
      start += 1.8;
      setAnimatedScore(Math.min(start, target));
      if (start < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [phase]);

  const gaugeAngle = (animatedScore / maxScore) * 180 - 90;
  const r = 60;
  const cx = 80, cy = 80;
  const arcStart = { x: cx - r, y: cy };
  const arcEnd = { x: cx + r, y: cy };
  const needleX = cx + (r - 12) * Math.cos(((gaugeAngle - 90) * Math.PI) / 180);
  const needleY = cy + (r - 12) * Math.sin(((gaugeAngle - 90) * Math.PI) / 180);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-[#080f06]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <div className="flex flex-col h-full px-[5vw] py-[4vh] gap-[2vh]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-[1vw] font-mono uppercase tracking-[0.25em] text-[var(--color-primary)]">Live Data Dashboard</span>
          <h1 className="text-[3.5vw] font-bold text-white font-display mt-1">
            Every kg. Every lot. Every grade.
          </h1>
        </motion.div>

        <div className="flex flex-1 gap-[2vw]">
          {/* Left column: bar chart + lot status */}
          <div className="flex-1 flex flex-col gap-[2vh]">
            {/* Weekly production bar chart */}
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-[2vw] flex-1"
              initial={{ opacity: 0, y: 24 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-[1.5vh]">
                <span className="text-[1.1vw] font-bold text-white">Production hebdomadaire</span>
                <span className="text-[0.8vw] text-white/40 font-mono">cerises vs parche (kg)</span>
              </div>
              <div className="flex items-end gap-[3%] h-[14vh]">
                {weeklyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-[10%] items-end h-full">
                      <motion.div
                        className="flex-1 rounded-t bg-[#15803d]"
                        initial={{ height: 0 }}
                        animate={phase >= 3 ? { height: `${(d.cherry / 750) * 100}%` } : { height: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                      />
                      <motion.div
                        className="flex-1 rounded-t bg-[#b45309]"
                        initial={{ height: 0 }}
                        animate={phase >= 3 ? { height: `${(d.parch / 750) * 100}%` } : { height: 0 }}
                        transition={{ delay: i * 0.1 + 0.15, duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[0.7vw] text-white/40 font-mono">{d.week}</span>
                    <span className="text-[0.65vw] font-mono font-bold" style={{ color: d.grade === 'AA' ? '#15803d' : d.grade === 'A' ? '#b45309' : '#6b7280' }}>{d.grade}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-5 mt-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#15803d]" /><span className="text-[0.75vw] text-white/50">Cerises</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#b45309]" /><span className="text-[0.75vw] text-white/50">Parche</span></div>
              </div>
            </motion.div>

            {/* Lot pipeline */}
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-[2vw]"
              initial={{ opacity: 0, y: 24 }}
              animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[1.1vw] font-bold text-white block mb-[1.5vh]">Lot Pipeline — KAHISA Station</span>
              <div className="flex flex-col gap-2">
                {lotStatus.map((lot, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[0.8vw] font-mono text-white/60 w-[6vw] shrink-0">{lot.lot}</span>
                    <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: lot.color }}
                        initial={{ width: 0 }}
                        animate={phase >= 4 ? { width: `${lot.progress}%` } : { width: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[0.75vw] font-mono shrink-0" style={{ color: lot.color }}>{lot.stage}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: cup score gauge + quality */}
          <div className="w-[30%] flex flex-col gap-[2vh]">
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-[2vw] flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <span className="text-[1vw] font-bold text-white mb-3">Cup Score</span>
              <svg width="160" height="100" viewBox="0 0 160 100">
                <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                  fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round" />
                <motion.path
                  d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                  fill="none" stroke="#15803d" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${Math.PI * r}`}
                  initial={{ strokeDashoffset: Math.PI * r }}
                  animate={phase >= 3 ? { strokeDashoffset: Math.PI * r * (1 - animatedScore / maxScore) } : { strokeDashoffset: Math.PI * r }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <line
                  x1={cx} y1={cy}
                  x2={needleX} y2={needleY}
                  stroke="#fef3c7" strokeWidth="2" strokeLinecap="round"
                />
                <circle cx={cx} cy={cy} r="5" fill="#b45309" />
                <text x={cx} y={cy + 22} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Space Grotesk">
                  {animatedScore.toFixed(1)}
                </text>
                <text x={cx} y={cy + 36} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">/ 100 pts</text>
              </svg>
              <div className="mt-1 px-3 py-1 rounded-full bg-[#15803d]/20 border border-[#15803d]/40">
                <span className="text-[0.8vw] font-bold text-[#15803d] font-mono">SPECIALTY GRADE</span>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-[2vw] flex flex-col gap-3"
              initial={{ opacity: 0, y: 24 }}
              animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-[1vw] font-bold text-white">Stock Quality</span>
              {[
                { label: 'Moisture', val: '11.2%', ok: true },
                { label: 'Defects', val: '3 / 300g', ok: true },
                { label: 'Screen Size', val: '15–18', ok: true },
                { label: 'Lot Status', val: 'Shipped', ok: true },
              ].map((q, i) => (
                <motion.div
                  key={i}
                  className="flex justify-between items-center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={phase >= 4 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                >
                  <span className="text-[0.85vw] text-white/50">{q.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.85vw] font-mono text-white">{q.val}</span>
                    <div className="w-4 h-4 rounded-full bg-[#15803d]/20 border border-[#15803d]/60 flex items-center justify-center">
                      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5"><path d="M2 5l2 2 4-4" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
