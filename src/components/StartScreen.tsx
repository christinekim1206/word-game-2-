import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div
      id="start-screen-container"
      className="flex flex-col items-center justify-between min-h-[580px] h-full w-full max-w-md mx-auto p-6 bg-white/80 rounded-3xl shadow-xl border-4 border-amber-300 backdrop-blur-sm"
    >
      {/* Header & Title */}
      <div className="flex flex-col items-center text-center mt-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-lg font-bold border-2 border-amber-300 mb-3"
        >
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>English Word Quiz</span>
        </motion.div>

        <motion.h1
          id="app-title"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-4xl sm:text-5xl font-bold tracking-tight text-amber-600 drop-shadow-sm"
        >
          Picture Guess
        </motion.h1>

        <p className="mt-2 text-xl text-slate-600 font-medium">
          Look at the picture. Guess the animal!
        </p>
      </div>

      {/* Decorative Mascot / Hero Center */}
      <motion.div
        id="start-screen-mascot"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
        className="relative my-6 flex flex-col items-center justify-center"
      >
        <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-amber-200 via-orange-100 to-yellow-200 flex items-center justify-center shadow-inner border-4 border-amber-300/80">
          <motion.span
            animate={{
              rotate: [0, -6, 6, -3, 3, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: 'easeInOut',
            }}
            className="text-7xl select-none"
          >
            🦁
          </motion.span>
        </div>

        {/* Orbiting mini animal preview emojis */}
        <div className="absolute -top-1 -right-1 text-3xl animate-bounce">
          🐶
        </div>
        <div className="absolute -bottom-2 -left-2 text-3xl animate-pulse">
          🐱
        </div>
        <div className="absolute top-1/2 -right-4 text-3xl">
          🐰
        </div>
      </motion.div>

      {/* Game Info Pill */}
      <div className="w-full text-center px-4 py-2.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-lg font-semibold mb-6">
        10 Fun Animal Questions
      </div>

      {/* Big Start Button: Font ≥ 20px, Height ≥ 60px */}
      <motion.button
        id="btn-start-game"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          soundEffects.playClickSound();
          onStart();
        }}
        className="w-full h-16 min-h-[64px] rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-2xl font-bold tracking-wide shadow-lg shadow-amber-500/30 flex items-center justify-center gap-3 border-b-4 border-amber-700 transition-all cursor-pointer"
      >
        <Play className="w-7 h-7 fill-white" />
        <span>Start</span>
      </motion.button>
    </div>
  );
};
