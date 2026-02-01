import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const confettiColors = ['#5DADE2', '#F4D03F', '#E74C3C', '#2ECC71', '#9B59B6', '#F39C12'];

function Confetti({ count = 50 }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: -20, 
            x: Math.random() * window.innerWidth,
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            y: window.innerHeight + 20,
            x: Math.random() * window.innerWidth,
            rotate: Math.random() * 720 - 360,
            opacity: 0
          }}
          transition={{ 
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ 
            backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            left: `${Math.random() * 100}%`
          }}
        />
      ))}
    </div>
  );
}

function HeartGlow() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
    >
      <div className="text-8xl">💛</div>
    </motion.div>
  );
}

function HighFive() {
  return (
    <motion.div
      initial={{ scale: 0, y: 100, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 1],
        y: [100, -20, 0],
        opacity: [0, 1, 1, 0]
      }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
    >
      <div className="text-8xl">🙌</div>
    </motion.div>
  );
}

export default function Celebration({ type = 'confetti', show = false, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {type === 'confetti' && <Confetti />}
          {type === 'heart' && <HeartGlow />}
          {type === 'highfive' && <HighFive />}
        </>
      )}
    </AnimatePresence>
  );
}