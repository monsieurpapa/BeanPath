import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const stats = [
  { label: 'Coopératives', value: '2', sub: 'TCC KAHISA + NAKEZA' },
  { label: 'Agriculteurs', value: '20+', sub: 'Kabare & Luhihi' },
  { label: 'kg tracés', value: '2.3M', sub: 'Registre KAHISA 2024' },
  { label: 'Offline', value: '100%', sub: 'Zero connectivity needed' },
];

const barData = [
  { week: 'Jul 14', kg: 480, fill: '#15803d' },
  { week: 'Jul 15', kg: 620, fill: '#15803d' },
  { week: 'Jul 16', kg: 390, fill: '#15803d' },
  { week: 'Jul 17', kg: 750, fill: '#b45309' },
  { week: 'Jul 18', kg: 530, fill: '#15803d' },
  { week: 'Jul 19', kg: 870, fill: '#b45309' },
  { week: 'Jul 20', kg: 680, fill: '#15803d' },
];

const maxKg = 870;

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-[#0d1a0a]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0 flex flex-col">
        <div className="flex flex-1">
          {/* Left */}
          <div className="w-[42%] h-full flex flex-col justify-center px-[5vw] gap-6">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="text-[1.1vw] font-mono uppercase tracking-[0.25em] text-[var(--color-primary)]">The Answer</span>
              <h1 className="text-[5vw] font-bold text-white font-display leading-[1.05] mt-2">
                BeanPath<br />
                <span className="text-[var(--color-primary)]">digitizes it all.</span>
              </h1>
              <p className="text-[1.3vw] text-white/50 mt-3 leading-relaxed">
                Locally-led, offline-first, EUDR-ready.<br />Built in 24 hours for the DRC.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <div className="text-[2.5vw] font-bold text-[var(--color-primary)] font-display">{s.value}</div>
                  <div className="text-[1vw] text-white font-medium">{s.label}</div>
                  <div className="text-[0.85vw] text-white/40">{s.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: chart + phone */}
          <div className="w-[58%] h-full flex flex-col items-center justify-center gap-6 px-[3vw]">
            {/* Bar chart */}
            <motion.div
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-[2vw]"
              initial={{ opacity: 0, y: 30 }}
              animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[1vw] font-bold text-white font-display">Livraisons cerises — Registre KAHISA</span>
                <span className="text-[0.8vw] text-white/40 font-mono">14–20 Jul 2024</span>
              </div>
              <div className="flex items-end gap-[1.5%] h-[12vh]">
                {barData.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className="w-full rounded-t-md"
                      style={{ background: b.fill }}
                      initial={{ height: 0 }}
                      animate={phase >= 4 ? { height: `${(b.kg / maxKg) * 100}%` } : { height: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                    />
                    <span className="text-[0.65vw] text-white/40 font-mono">{b.week.slice(4)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#15803d]" />
                  <span className="text-[0.75vw] text-white/50">Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#b45309]" />
                  <span className="text-[0.75vw] text-white/50">Peak day</span>
                </div>
              </div>
            </motion.div>

            {/* Phone mockup */}
            <motion.div
              className="w-[130px] h-[260px] bg-black rounded-[28px] border-4 border-gray-800 shadow-2xl overflow-hidden relative shrink-0"
              initial={{ opacity: 0, y: 50, rotate: 8 }}
              animate={phase >= 2 ? { opacity: 1, y: 0, rotate: -3 } : { opacity: 0, y: 50, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.2 }}
            >
              <div className="h-16 bg-gradient-to-b from-green-700 to-green-600 px-3 pt-3">
                <div className="text-white font-bold text-xs">Tableau de bord</div>
                <div className="text-white/70 text-[9px]">Bahati · Agent</div>
              </div>
              <div className="bg-white h-full px-3 py-2 space-y-2">
                {[{ label: 'Livraisons', val: '3' }, { label: 'Lots actifs', val: '1' }, { label: 'En attente sync', val: '2' }].map((r, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-2 py-1.5">
                    <span className="text-gray-600 text-[9px]">{r.label}</span>
                    <span className="text-gray-900 font-bold text-xs">{r.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
