import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const text = "Coffee farmers in Congo don't exist on paper.";

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[#080f06]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }} // short exit for wait mode
    >
      <motion.div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/coffee-farm.png)` }}
        animate={{ scale: [1.1, 1] }}
        transition={{ duration: 4, ease: 'easeOut' }}
      />
      
      <div className="relative z-10 w-full px-20 text-center">
        <h1 className="text-[6vw] font-bold text-white leading-tight font-display tracking-tight" style={{ perspective: 1000 }}>
          {text.split(' ').map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[2vw]"
              initial={{ opacity: 0, y: 40, rotateX: 40 }}
              animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        
        <motion.div
          className="w-24 h-1 bg-[var(--color-primary)] mx-auto mt-12 origin-left"
          initial={{ scaleX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: 'circOut' }}
        />
      </div>
    </motion.div>
  );
}
