import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex bg-[#0d1a0a]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      {/* Left: No Internet */}
      <motion.div 
        className="w-1/2 h-full flex flex-col items-center justify-center relative overflow-hidden"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-red-900/20 z-0" />
        <motion.div 
          className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-8 relative z-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </motion.div>
        <h2 className="text-[4vw] font-bold text-red-500/80 font-display relative z-10">No internet</h2>
      </motion.div>

      {/* Right: Offline First */}
      <motion.div 
        className="w-1/2 h-full flex flex-col items-center justify-center relative overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-green-900/10 z-0" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-green-500/30 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white font-mono text-lg tracking-wider">SYNC: QUEUED (3)</span>
          </motion.div>
          
          <motion.h2 
            className="text-[4vw] font-bold text-white font-display"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          >
            Native offline.
          </motion.h2>
          <motion.h2 
            className="text-[3.5vw] font-bold text-[#9CA3AF] font-display"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          >
            Zero excuses.
          </motion.h2>
        </div>
      </motion.div>

      {/* Center divider */}
      <motion.div 
        className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/10 -translate-x-1/2"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8 }}
      />
    </motion.div>
  );
}
