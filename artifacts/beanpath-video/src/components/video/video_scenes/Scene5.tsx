import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200), // title
      setTimeout(() => setPhase(2), 600), // grid starts
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const roles = [
    { name: "Bulonza M.", role: "Agent de terrain", surface: "Field" },
    { name: "Shamavu M.", role: "Agriculteur leader", surface: "Field" },
    { name: "J-B KABILA", role: "Opérateur station", surface: "Console" },
    { name: "Alexis NGOIE", role: "Opérateur moulin", surface: "Console" },
    { name: "Dr. Marie L.", role: "Inspecteur", surface: "Console" },
    { name: "Patrick M.", role: "Exportateur", surface: "Console" },
    { name: "Lars ERIKSEN", role: "Acheteur", surface: "Buyer" },
    { name: "Bishops K.", role: "Administrateur", surface: "Console" },
    { name: "Sophie M.", role: "Certificateur", surface: "Console" }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#080f06]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <motion.div 
        className="text-center relative z-10 mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="text-[5vw] font-bold text-white font-display leading-none mb-2">10 roles. 25 permissions.</h1>
        <h2 className="text-[3vw] font-bold text-[var(--color-primary)] font-display">One platform.</h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-6 relative z-10">
        {roles.map((role, i) => (
          <motion.div
            key={i}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 w-64 shadow-xl"
            initial={{ opacity: 0, scale: 0.5, rotate: Math.random() * 20 - 10 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.5, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 flex items-center justify-center text-white font-bold">
                {role.name[0]}
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-white/70 font-mono">
                {role.surface}
              </span>
            </div>
            <div className="font-bold text-white text-lg truncate">{role.name}</div>
            <div className="text-[#9CA3AF] text-sm truncate">{role.role}</div>
          </motion.div>
        ))}
      </div>

      {/* EUDR Badge */}
      <motion.div
        className="absolute bottom-10 right-10 w-24 h-24 border-2 border-green-500 rounded-full flex items-center justify-center bg-green-500/20 backdrop-blur-md rotate-12"
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1.5 }}
      >
        <span className="text-green-500 font-bold font-display text-xl">EUDR<br/>READY</span>
      </motion.div>
    </motion.div>
  );
}
