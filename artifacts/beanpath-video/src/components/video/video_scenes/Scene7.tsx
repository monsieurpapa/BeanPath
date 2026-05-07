import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const text = "built with passion";

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-black"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <div className="text-center relative z-10" style={{ perspective: 1000 }}>
        {/* Built with passion */}
        <h2 className="text-[3vw] font-display text-[#9CA3AF] mb-4 uppercase tracking-[0.2em]">
          {text.split('').map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={phase >= 1 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h2>

        {/* Name */}
        <motion.h1 
          className="text-[7vw] font-bold font-display tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-amber-300"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          Dieudonne Munganga
        </motion.h1>

        {/* Links */}
        <motion.div
          className="space-y-2 text-[#6B7280] font-mono text-[1.2vw]"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <p>dieudonneishara@gmail.com</p>
          <p>linkedin.com/in/dieudonné-munganga-b01111b7</p>
          <p className="mt-6 text-white/40">BeanPath — 24h Build Challenge</p>
        </motion.div>
      </div>
      
      {/* Subtle background drift */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/10 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );
}
