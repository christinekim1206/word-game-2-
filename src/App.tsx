/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenMode, Question } from './types';
import { generateGameQuestions } from './data/animals';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { EndScreen } from './components/EndScreen';

export default function App() {
  const [screen, setScreen] = useState<ScreenMode>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const startNewGame = () => {
    const newQuestions = generateGameQuestions(10);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setScreen('game');
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setScreen('end');
    }
  };

  return (
    <main
      id="app-root-container"
      className="min-h-screen w-full bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none"
    >
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {screen === 'start' && (
            <motion.div
              key="screen-start"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <StartScreen onStart={startNewGame} />
            </motion.div>
          )}

          {screen === 'game' && questions.length > 0 && (
            <motion.div
              key={`screen-game-${questions[currentIndex]?.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <GameScreen
                question={questions[currentIndex]}
                questionIndex={currentIndex}
                totalQuestions={questions.length}
                score={score}
                onAnswer={handleAnswer}
                onNext={handleNextQuestion}
              />
            </motion.div>
          )}

          {screen === 'end' && (
            <motion.div
              key="screen-end"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <EndScreen
                score={score}
                totalQuestions={questions.length || 10}
                onPlayAgain={startNewGame}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
