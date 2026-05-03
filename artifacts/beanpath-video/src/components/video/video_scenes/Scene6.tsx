import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  const features = [
    "RBAC",
    "Offline sync",
    "Responsive landing",
    "Phone mockup",
    "20 farmers",
    "Real data",
    "QR downloads",
    "Waitlist form",
    "README"
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600), // features start
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#091520]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <motion.h1 
        className="text-[5vw] font-bold text-white font-display mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      >
        What we shipped
      </motion.h1>

      <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-left">
        {features.map((feat, i) => (
          <motion.div
            key={i}
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -30 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: i * 0.1 }}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[2.5vw] font-display text-white">{feat}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
