import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const problems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-red-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    tag: "PROBLEM 01",
    headline: "No locally-led\ntraceability tools",
    sub: "Farmers in South Kivu rely on paper registers. Data evaporates. No ownership, no continuity.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-orange-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" strokeWidth={1.5} />
      </svg>
    ),
    tag: "PROBLEM 02",
    headline: "Production chain\nnot digitalized",
    sub: "Cherry → parchment → export is invisible. No lot history. No chain of custody. Exporters guess.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-yellow-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    tag: "PROBLEM 03",
    headline: "No producer–buyer\nreadiness monitoring",
    sub: "Buyers in Oslo or Tokyo can't verify EUDR compliance. Contracts stall. Premium prices are lost.",
  },
];

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2600),
      setTimeout(() => setPhase(5), 7200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#080f06] overflow-hidden"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/coffee-farm.png)` }}
        animate={{ scale: [1.05, 1] }}
        transition={{ duration: 9, ease: 'easeOut' }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080f06]/60 to-[#080f06]" />

      <div className="relative z-10 w-full px-[6vw]">
        <motion.div
          className="mb-[3vh]"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-[1.2vw] uppercase tracking-[0.3em] text-red-400/80 font-mono">The Reality on the Ground</span>
          <h1 className="text-[4vw] font-bold text-white font-display mt-2 leading-tight">
            Three problems blocking DRC's<br />
            <span className="text-red-400">coffee value chain</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-3 gap-[2vw]">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-[2vw] flex flex-col gap-4"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={phase >= i + 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-red-900/30 border border-red-500/30 flex items-center justify-center shrink-0">
                  {p.icon}
                </div>
                <span className="text-[0.9vw] font-mono uppercase tracking-widest text-red-400/70">{p.tag}</span>
              </div>
              <h2 className="text-[1.8vw] font-bold text-white font-display leading-tight whitespace-pre-line">{p.headline}</h2>
              <p className="text-[1.1vw] text-white/50 leading-relaxed">{p.sub}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-[3vh] flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={phase >= 5 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
          <span className="text-[1.1vw] text-[var(--color-primary)] font-display font-bold tracking-widest uppercase">BeanPath solves all three</span>
          <div className="h-px flex-1 bg-gradient-to-l from-[var(--color-primary)] to-transparent" />
        </motion.div>
      </div>
    </motion.div>
  );
}
