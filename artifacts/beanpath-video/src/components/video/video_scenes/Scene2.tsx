import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[#0d1a0a]"
      {...sceneTransitions.fadeBlur}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0 flex">
        {/* Left text */}
        <div className="w-1/2 h-full flex flex-col justify-center px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className="text-[3vw] font-bold text-[var(--color-primary)] font-display tracking-tight leading-none mb-4">
              BeanPath
            </h2>
            <h1 className="text-[5vw] font-bold text-white font-display leading-[1.1]">
              We built the solution.
            </h1>
            <h1 className="text-[5vw] font-bold text-[#9CA3AF] font-display leading-[1.1]">
              In 24 hours.
            </h1>
          </motion.div>
        </div>

        {/* Right Phone Mockup */}
        <div className="w-1/2 h-full flex items-center justify-center relative z-10">
          <motion.div 
            className="w-[300px] h-[600px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden relative"
            initial={{ opacity: 0, y: 100, rotate: 10 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 100, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Screen 1 */}
            <motion.div 
              className="absolute inset-0 bg-white"
              animate={{ opacity: phase >= 3 ? [1, 0, 0, 1] : 1 }}
              transition={{ duration: 9, repeat: Infinity, times: [0, 0.33, 0.66, 1] }}
            >
              <div className="h-40 bg-gradient-to-b from-green-700 to-green-600 p-6 flex flex-col justify-end">
                <div className="text-white font-bold text-2xl">Bahati's Stats</div>
                <div className="text-white/80">3 Deliveries</div>
              </div>
              <div className="p-4 space-y-4">
                <div className="h-20 bg-gray-100 rounded-xl" />
                <div className="h-20 bg-gray-100 rounded-xl" />
                <div className="h-20 bg-gray-100 rounded-xl" />
              </div>
            </motion.div>

            {/* Screen 2 */}
            <motion.div 
              className="absolute inset-0 bg-white"
              animate={{ opacity: phase >= 3 ? [0, 1, 0, 0] : 0 }}
              transition={{ duration: 9, repeat: Infinity, times: [0, 0.33, 0.66, 1] }}
            >
              <div className="p-6 pt-12 space-y-6">
                <div className="text-2xl font-bold text-gray-900">Collecte</div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center px-4 text-gray-500">Farmer...</div>
                  <div className="h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center px-4 text-gray-500">Weight (kg)</div>
                  <div className="h-12 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold">Submit</div>
                </div>
              </div>
            </motion.div>

            {/* Screen 3 */}
            <motion.div 
              className="absolute inset-0 bg-white"
              animate={{ opacity: phase >= 3 ? [0, 0, 1, 0] : 0 }}
              transition={{ duration: 9, repeat: Infinity, times: [0, 0.33, 0.66, 1] }}
            >
               <div className="p-6 pt-12 space-y-4">
                <div className="h-10 bg-gray-100 rounded-full border border-gray-200 flex items-center px-4 text-gray-400">Search farmers...</div>
                <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100" />
                  <div>
                    <div className="font-bold text-gray-900">Mugisho</div>
                    <div className="text-sm text-gray-500">Bio-ID: 1042</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100" />
                  <div>
                    <div className="font-bold text-gray-900">Amani</div>
                    <div className="text-sm text-gray-500">Bio-ID: 1043</div>
                  </div>
                </div>
               </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
