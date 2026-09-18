import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Star } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface EndScreenProps {
  score: number;
  totalQuestions: number;
  onPlayAgain: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  score,
  totalQuestions,
  onPlayAgain,
}) => {
  // Score is out of 100 (10 questions x 10 points each)
  const maxScore = totalQuestions * 10;
  const percentage = Math.round((score / maxScore) * 100);

  let stars = 1;
  let cheerTitle = 'Keep Practicing!';
  let cheerEmoji = '👏';

  if (percentage >= 80) {
    stars = 3;
    cheerTitle = percentage === 100 ? 'Super Star!' : 'Awesome Job!';
    cheerEmoji = '🏆';
  } else if (percentage >= 50) {
    stars = 2;
    cheerTitle = 'Good Job!';
    cheerEmoji = '⭐';
  }

  useEffect(() => {
    soundEffects.playFanfare();
  }, []);

  return (
    <div
      id="end-screen-container"
      className="flex flex-col items-center justify-between min-h-[580px] h-full w-full max-w-md mx-auto p-6 bg-white/85 rounded-3xl shadow-xl border-4 border-amber-300 backdrop-blur-sm text-center"
    >
      {/* Title & Celebration */}
      <div className="flex flex-col items-center mt-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
          className="text-6xl mb-2 select-none"
        >
          {cheerEmoji}
        </motion.div>

        <motion.h2
          id="end-cheer-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-extrabold text-amber-600 drop-shadow-sm"
        >
          {cheerTitle}
        </motion.h2>

        <p className="text-xl text-slate-600 mt-1 font-medium">Round Finished!</p>
      </div>

      {/* Stars Display: 1–3 stars */}
      <div id="stars-container" className="flex items-center justify-center gap-3 my-6">
        {[1, 2, 3].map((starIndex) => {
          const isActive = starIndex <= stars;
          return (
            <motion.div
              key={starIndex}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2 + starIndex * 0.15,
                type: 'spring',
                bounce: 0.6,
              }}
              className="relative"
            >
              <Star
                className={`w-16 h-16 sm:w-20 sm:h-20 ${
                  isActive
                    ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                    : 'text-slate-200 fill-slate-200'
                }`}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Score Box */}
      <motion.div
        id="final-score-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full py-4 px-6 rounded-2xl bg-amber-50 border-3 border-amber-300 shadow-inner flex flex-col items-center gap-1 mb-6"
      >
        <span className="text-xl font-bold text-amber-800">Your Score</span>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-amber-600">{score}</span>
          <span className="text-2xl font-bold text-amber-400">/ {maxScore}</span>
        </div>
        <span className="text-lg font-semibold text-amber-700">
          {score / 10} of {totalQuestions} Correct
        </span>
      </motion.div>

      {/* Play Again Button: Height ≥ 60px, Font ≥ 20px */}
      <motion.button
        id="btn-play-again"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          soundEffects.playClickSound();
          onPlayAgain();
        }}
        className="w-full h-16 min-h-[64px] rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-2xl font-bold tracking-wide shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 border-b-4 border-emerald-700 transition-all cursor-pointer"
      >
        <RotateCcw className="w-7 h-7" />
        <span>Play Again</span>
      </motion.button>
    </div>
  );
};
