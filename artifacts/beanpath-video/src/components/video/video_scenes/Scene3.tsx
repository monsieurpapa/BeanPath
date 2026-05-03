import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const farmPolygons = [
  { id: 'F1', points: '120,80 160,65 185,90 175,120 140,130 110,110', color: '#15803d', label: 'Cinjava', kg: '312 kg', farmer: 'Mugisho' },
  { id: 'F2', points: '200,55 240,45 260,75 245,100 210,105 190,80', color: '#15803d', label: 'Muganzo', kg: '248 kg', farmer: 'Amani' },
  { id: 'F3', points: '270,90 310,78 330,105 318,135 285,140 260,118', color: '#b45309', label: 'Itara', kg: '495 kg', farmer: 'Bahati' },
  { id: 'F4', points: '145,148 185,138 205,165 190,195 155,200 130,175', color: '#15803d', label: 'Kahisa', kg: '187 kg', farmer: 'Zawadi' },
  { id: 'F5', points: '215,155 250,145 270,172 258,200 225,205 205,182', color: '#15803d', label: 'Camuhozi', kg: '276 kg', farmer: 'Furaha' },
  { id: 'F6', points: '330,50 365,40 385,68 372,95 340,98 318,72', color: '#b45309', label: 'Luhihi', kg: '423 kg', farmer: 'Neema' },
];

const chainNodes = [
  { label: 'Farm', icon: '🌱', persona: { name: 'Bulonza M.', role: 'Agent terrain' } },
  { label: 'Station', icon: '🏭', persona: { name: 'J-B Kabila', role: 'Opérateur' } },
  { label: 'Moulin', icon: '⚙️', persona: { name: 'Alexis N.', role: 'Moulin' } },
  { label: 'Export', icon: '📦', persona: { name: 'Patrick M.', role: 'Exportateur' } },
  { label: 'Buyer', icon: '🌍', persona: { name: 'Lars E.', role: 'Acheteur' } },
];

export function Scene3() {
  const [phase, setPhase] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3200),
      setTimeout(() => setPhase(5), 4200),
      setTimeout(() => setPhase(6), 5200),
      setTimeout(() => setPhase(7), 6800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex bg-[#091520]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      {/* Left: Geo Map */}
      <div className="w-[55%] h-full flex flex-col justify-center px-[4vw] gap-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-[1vw] font-mono uppercase tracking-[0.25em] text-[var(--color-secondary)]">Farm Geo Registry</span>
          <h2 className="text-[3vw] font-bold text-white font-display mt-1">
            South Kivu — DRC
          </h2>
          <p className="text-[1vw] text-white/40 mt-1">Farm plots with geo-polygon boundaries · Real KAHISA data</p>
        </motion.div>

        <motion.div
          className="w-full bg-[#0a1a10]/80 border border-[var(--color-secondary)]/30 rounded-2xl overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5 }}
        >
          <svg viewBox="0 0 500 260" className="w-full" style={{ height: '28vh' }}>
            {/* Grid lines */}
            {[40, 80, 120, 160, 200, 240].map(y => (
              <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="white" strokeOpacity="0.03" strokeWidth="1" />
            ))}
            {[100, 200, 300, 400].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="260" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
            ))}

            {/* Farm polygons */}
            {farmPolygons.map((farm, i) => (
              <motion.g key={farm.id}>
                <motion.polygon
                  points={farm.points}
                  fill={farm.color}
                  fillOpacity={hovered === farm.id ? 0.55 : 0.35}
                  stroke={farm.color}
                  strokeWidth="2"
                  strokeOpacity={0.9}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={phase >= 3 + Math.floor(i / 2) ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20, delay: (i % 2) * 0.12 }}
                  onHoverStart={() => setHovered(farm.id)}
                  onHoverEnd={() => setHovered(null)}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center', cursor: 'default' }}
                />
                <motion.text
                  x={farm.points.split(' ').reduce((s, p, j) => j % 2 === 0 ? s + parseFloat(p) : s, 0) / (farm.points.split(' ').length / 2)}
                  y={farm.points.split(' ').reduce((s, p, j) => j % 2 !== 0 ? s + parseFloat(p) : s, 0) / (farm.points.split(' ').length / 2)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                  opacity={0.9}
                  initial={{ opacity: 0 }}
                  animate={phase >= 4 ? { opacity: 0.9 } : { opacity: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {farm.label}
                </motion.text>
              </motion.g>
            ))}

            {/* Station dot */}
            <motion.circle
              cx="230" cy="155" r="8" fill="#b45309" stroke="#fef3c7" strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            <motion.text x="230" y="172" textAnchor="middle" fill="#fef3c7" fontSize="8" fontWeight="bold"
              initial={{ opacity: 0 }} animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.3 }}>
              KAHISA
            </motion.text>
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-6 px-4 pb-3 pt-1">
            {farmPolygons.slice(0, 3).map(f => (
              <motion.div
                key={f.id}
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={phase >= 5 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: f.color }} />
                <span className="text-[0.75vw] text-white/60">{f.farmer} · {f.kg}</span>
              </motion.div>
            ))}
            <span className="text-[0.75vw] text-white/30 ml-auto">+{farmPolygons.length - 3} more farms</span>
          </div>
        </motion.div>
      </div>

      {/* Right: Chain with personas */}
      <div className="w-[45%] h-full flex flex-col justify-center px-[3vw] gap-5">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <span className="text-[1vw] font-mono uppercase tracking-[0.25em] text-[var(--color-primary)]">Digitalized Chain</span>
          <h2 className="text-[2.5vw] font-bold text-white font-display mt-1">Every step. Every hand.</h2>
        </motion.div>

        <div className="relative flex flex-col gap-0">
          {chainNodes.map((node, i) => (
            <div key={i} className="flex items-stretch gap-4">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg shrink-0"
                  initial={{ scale: 0, opacity: 0, borderColor: 'rgba(255,255,255,0.2)' }}
                  animate={phase >= i + 2 ? { scale: 1, opacity: 1, borderColor: 'var(--color-primary)' } : { scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  style={{ background: phase >= i + 2 ? 'rgba(180,83,9,0.15)' : 'transparent' }}
                >
                  {node.icon}
                </motion.div>
                {i < chainNodes.length - 1 && (
                  <motion.div
                    className="w-px bg-[var(--color-primary)] origin-top"
                    style={{ height: '3vh' }}
                    initial={{ scaleY: 0 }}
                    animate={phase >= i + 3 ? { scaleY: 1 } : { scaleY: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                )}
              </div>

              {/* Card */}
              <motion.div
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-2 flex items-center justify-between"
                initial={{ opacity: 0, x: 30 }}
                animate={phase >= i + 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <div>
                  <div className="text-[1.1vw] font-bold text-white">{node.persona.name}</div>
                  <div className="text-[0.85vw] text-white/50">{node.persona.role} · {node.label}</div>
                </div>
                <motion.div
                  className="w-6 h-6 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/60 flex items-center justify-center"
                  animate={phase >= i + 3 ? { scale: [1, 1.3, 1], borderColor: ['rgba(21,128,61,0.6)', 'rgba(21,128,61,1)', 'rgba(21,128,61,0.6)'] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
                </motion.div>
              </motion.div>
            </div>
          ))}
        </div>

        <motion.div
          className="text-[0.9vw] text-white/30 font-mono"
          initial={{ opacity: 0 }}
          animate={phase >= 7 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          Lot #5251 · KAHISA Lot 14002 → Nordic Roasters AS ✓
        </motion.div>
      </div>
    </motion.div>
  );
}
