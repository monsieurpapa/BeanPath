import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000), // Node 1
      setTimeout(() => setPhase(3), 2000), // Node 2
      setTimeout(() => setPhase(4), 3000), // Node 3
      setTimeout(() => setPhase(5), 4000), // Node 4
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const nodes = ['Farm', 'Station', 'Export', 'Buyer'];
  const people = [
    { name: "Bulonza", role: "Agent de terrain", img: "images/farmer.jpg" },
    { name: "Jean-Baptiste", role: "Opérateur de station", img: null },
    { name: "Patrick", role: "Exportateur", img: null },
    { name: "Lars", role: "Acheteur", img: null }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#091520]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <motion.div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/coffee-cherries.png)` }}
        animate={{ y: [0, -20] }}
        transition={{ duration: 7, ease: 'linear' }}
      />
      
      <motion.h1 
        className="text-[4vw] font-bold text-white font-display relative z-10 mb-20"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
      >
        The Supply Chain
      </motion.h1>

      <div className="flex items-center justify-between w-[80vw] relative z-10 h-64">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-[var(--color-primary)] -translate-y-1/2 z-0 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: phase >= 2 ? (phase - 1) * 0.333 : 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />

        {nodes.map((node, i) => (
          <div key={i} className="relative flex flex-col items-center justify-center z-10 w-48">
            {/* Person Card */}
            <motion.div 
              className="absolute -top-32 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={phase >= i + 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {people[i].img && (
                <div className="w-12 h-12 mx-auto rounded-full overflow-hidden mb-2">
                  <img src={`${import.meta.env.BASE_URL}${people[i].img}`} className="w-full h-full object-cover" />
                </div>
              )}
              {!people[i].img && (
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-primary)]/30 border border-[var(--color-primary)] mb-2 flex items-center justify-center text-white font-bold">
                  {people[i].name[0]}
                </div>
              )}
              <div className="text-white font-bold text-sm truncate">{people[i].name}</div>
              <div className="text-[#9CA3AF] text-xs truncate">{people[i].role}</div>
            </motion.div>

            {/* Node Dot */}
            <motion.div 
              className="w-6 h-6 rounded-full bg-[#091520] border-4 border-white/50 relative z-10"
              animate={phase >= i + 2 ? { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary)' } : {}}
              transition={{ duration: 0.3 }}
            >
              {phase >= i + 2 && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-50"
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div className="mt-4 text-white font-bold text-lg font-display uppercase tracking-widest">{node}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
