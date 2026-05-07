import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const roles = [
  { name: 'Bulonza MUDUMBI', role: 'Agent de terrain', org: 'TCC Tounga wa Café', surface: 'Field', ready: true },
  { name: 'Shamavu MIRUHO', role: 'Agriculteur leader', org: 'TCC KAHISA', surface: 'Field', ready: true },
  { name: 'J-B KABILA', role: 'Opérateur station', org: 'Station KAHISA', surface: 'Console', ready: true },
  { name: 'Alexis NGOIE', role: 'Opérateur moulin', org: 'Moulin de Bukavu', surface: 'Console', ready: true },
  { name: 'Dr. Marie LUKUSA', role: 'Inspecteur qualité', org: 'CQI DRC', surface: 'Console', ready: true },
  { name: 'Patrick MWAMBA', role: 'Exportateur', org: 'Great Lakes Export', surface: 'Console', ready: true },
  { name: 'Bishops KAJEREGE', role: 'Administrateur', org: 'NAKEZA SARL', surface: 'Console', ready: true },
  { name: 'Sophie MÜLLER', role: 'Certificateur', org: 'FLO-CERT GmbH', surface: 'Console', ready: true },
  { name: 'Lars ERIKSEN', role: 'Acheteur', org: 'Nordic Roasters AS', surface: 'Buyer', ready: true },
];

const surfaceColor: Record<string, string> = {
  Field: '#15803d',
  Console: '#b45309',
  Buyer: '#3b82f6',
};

export function Scene5() {
  const [phase, setPhase] = useState(0);
  const [contractPhase, setContractPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setContractPhase(1), 3200),
      setTimeout(() => setContractPhase(2), 4400),
      setTimeout(() => setContractPhase(3), 5600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-[#080f06]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <div className="flex flex-1 gap-0">
        {/* Left: personas */}
        <div className="w-[60%] flex flex-col px-[4vw] py-[4vh]">
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: -16 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-[3vw] font-bold text-white font-display">10 roles. 25 permissions.</h1>
            <h2 className="text-[2vw] font-bold text-[var(--color-primary)] font-display">One platform.</h2>
          </motion.div>

          <div className="grid grid-cols-3 gap-3 flex-1">
            {roles.map((role, i) => (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col gap-2"
                initial={{ opacity: 0, scale: 0.6, y: 30 }}
                animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.6, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.07 }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: `${surfaceColor[role.surface]}30`, border: `1.5px solid ${surfaceColor[role.surface]}` }}
                  >
                    {role.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <span
                    className="text-[0.65vw] uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                    style={{ color: surfaceColor[role.surface], background: `${surfaceColor[role.surface]}20` }}
                  >
                    {role.surface}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-white text-[0.9vw] truncate leading-tight">{role.name.split(' ')[0]}</div>
                  <div className="text-white/50 text-[0.75vw] truncate">{role.role}</div>
                  <div className="text-white/30 text-[0.65vw] truncate mt-0.5">{role.org}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: contract readiness monitor */}
        <div className="w-[40%] flex flex-col justify-center px-[3vw] gap-4 border-l border-white/10">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={contractPhase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="text-[0.9vw] font-mono uppercase tracking-[0.2em] text-[#3b82f6]">Producer–Buyer Monitor</span>
            <h2 className="text-[2.5vw] font-bold text-white font-display mt-1 leading-tight">
              Contract<br />Readiness
            </h2>
          </motion.div>

          {/* Buyer card */}
          <motion.div
            className="bg-[#1e3a5f]/40 border border-[#3b82f6]/30 rounded-2xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={contractPhase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/60 flex items-center justify-center font-bold text-[#3b82f6]">LE</div>
              <div>
                <div className="text-white font-bold text-[1vw]">Lars ERIKSEN</div>
                <div className="text-white/50 text-[0.8vw]">Nordic Roasters AS · Oslo</div>
              </div>
            </div>
            <div className="text-[0.8vw] text-white/40 mb-2 font-mono">EUDR Compliance Check</div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Geo polygon registered', done: contractPhase >= 2 },
                { label: 'Supply chain documented', done: contractPhase >= 2 },
                { label: 'Cup score ≥ 82 (Specialty)', done: contractPhase >= 2 },
                { label: 'Certifications attached', done: contractPhase >= 3 },
                { label: 'Lot exported & traceable', done: contractPhase >= 3 },
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{ background: check.done ? '#15803d20' : 'rgba(255,255,255,0.05)', border: `1px solid ${check.done ? '#15803d' : 'rgba(255,255,255,0.1)'}` }}
                    animate={check.done ? { scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {check.done && (
                      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                        <path d="M2 5l2 2 4-4" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </motion.div>
                  <span className="text-[0.8vw]" style={{ color: check.done ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }}>{check.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Readiness badge */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={contractPhase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="px-6 py-3 rounded-full bg-[#15803d]/20 border-2 border-[#15803d] flex items-center gap-3">
              <motion.div
                className="w-3 h-3 rounded-full bg-[#15803d]"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[1.2vw] font-bold text-[#15803d] font-display tracking-wider">CONTRACT READY</span>
            </div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={contractPhase >= 3 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-[0.75vw] text-white/30 font-mono">EUDR · Fair Trade · Organic · Rainforest Alliance</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
