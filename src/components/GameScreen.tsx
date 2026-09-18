import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Question, AnimalWord } from '../types';
import { ANIMAL_MAP } from '../data/animals';
import { soundEffects, speakText } from '../utils/sound';

interface GameScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  question,
  questionIndex,
  totalQuestions,
  score,
  onAnswer,
  onNext,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);
  const [useEmojiFallback, setUseEmojiFallback] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<AnimalWord | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [feedbackSentence, setFeedbackSentence] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const targetInfo = ANIMAL_MAP.get(question.target)!;
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load animal picture whenever question target changes
  useEffect(() => {
    // Reset state for new question
    setImageUrl(null);
    setIsLoadingImage(true);
    setUseEmojiFallback(false);
    setSelectedOption(null);
    setHasAnswered(false);
    setFeedbackSentence('');
    setIsCorrect(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let isMounted = true;

    async function fetchAnimalImage() {
      try {
        const response = await fetch('/api/generate-animal-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ animal: question.target }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!isMounted) return;

        if (data.success && data.imageUrl) {
          setImageUrl(data.imageUrl);
          setIsLoadingImage(false);
        } else {
          // Gemini failed or key missing: fallback to cute large emoji immediately
          setUseEmojiFallback(true);
          setIsLoadingImage(false);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          setUseEmojiFallback(true);
          setIsLoadingImage(false);
        }
      }
    }

    fetchAnimalImage();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [question.id, question.target]);

  const handleSelectOption = (option: AnimalWord) => {
    if (hasAnswered) return;

    soundEffects.playClickSound();

    const correct = option === question.target;
    setSelectedOption(option);
    setHasAnswered(true);
    setIsCorrect(correct);

    let sentenceToSpeak = '';
    if (correct) {
      sentenceToSpeak = `Correct! It's ${targetInfo.article} ${targetInfo.word}.`;
      setFeedbackSentence(sentenceToSpeak);
      soundEffects.playCorrectSound();
    } else {
      sentenceToSpeak = `It's ${targetInfo.article} ${targetInfo.word}.`;
      setFeedbackSentence(sentenceToSpeak);
      soundEffects.playWrongSound();
    }

    // Read aloud for elementary student
    speakText(sentenceToSpeak);

    // Update score in parent
    onAnswer(correct);
  };

  const handleReplayAudio = () => {
    soundEffects.playClickSound();
    if (feedbackSentence) {
      speakText(feedbackSentence);
    }
  };

  return (
    <div
      id="game-screen-container"
      className="flex flex-col justify-between min-h-[640px] w-full max-w-md mx-auto p-4 sm:p-6 bg-white/85 rounded-3xl shadow-xl border-4 border-amber-300 backdrop-blur-sm"
    >
      {/* Top Bar: Question Progress and Live Score */}
      <div id="game-status-bar" className="flex items-center justify-between gap-2 mb-3">
        <div
          id="question-indicator"
          className="px-4 py-2 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold text-xl flex items-center gap-1.5"
        >
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>{questionIndex + 1} / {totalQuestions}</span>
        </div>

        <div
          id="score-indicator"
          className="px-4 py-2 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-bold text-xl flex items-center gap-1.5 shadow-sm"
        >
          <span>Score:</span>
          <span className="text-emerald-700">{score}</span>
        </div>
      </div>

      {/* Picture Container (Large in Center) */}
      <div
        id="animal-display-area"
        className="relative w-full aspect-square max-h-[260px] sm:max-h-[300px] rounded-3xl bg-amber-50 border-4 border-amber-200 overflow-hidden flex flex-col items-center justify-center shadow-inner mx-auto my-2"
        style={{ backgroundColor: targetInfo.color + '40' }}
      >
        <AnimatePresence mode="wait">
          {isLoadingImage ? (
            <motion.div
              key="loading-state"
              id="image-loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-4 text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="text-6xl mb-2 select-none"
              >
                {targetInfo.emoji}
              </motion.div>
              <div className="text-2xl font-bold text-amber-700 tracking-wide animate-pulse">
                Loading...
              </div>
            </motion.div>
          ) : imageUrl && !useEmojiFallback ? (
            <motion.div
              key="image-loaded"
              id="image-loaded-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full p-2 flex items-center justify-center"
            >
              <img
                id="animal-generated-picture"
                src={imageUrl}
                alt={`Cartoon ${question.target}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-2xl select-none"
                onError={() => setUseEmojiFallback(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="emoji-fallback"
              id="emoji-fallback-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center justify-center w-full h-full p-4"
            >
              <div className="w-36 h-36 rounded-full bg-white/90 shadow-md border-4 border-amber-300 flex items-center justify-center">
                <span className="text-7xl sm:text-8xl select-none">
                  {targetInfo.emoji}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Answer Feedback Banner (when answered) */}
      <div className="min-h-[56px] flex items-center justify-center my-1">
        {hasAnswered && (
          <motion.div
            id="answer-feedback-banner"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`w-full py-2.5 px-4 rounded-2xl flex items-center justify-between border-2 shadow-sm ${
              isCorrect
                ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                : 'bg-rose-100 border-rose-400 text-rose-950'
            }`}
          >
            <div className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span>{isCorrect ? '🎉' : '💡'}</span>
              <span>{feedbackSentence}</span>
            </div>

            <button
              id="btn-speak-again"
              onClick={handleReplayAudio}
              title="Listen again"
              className="p-2 rounded-xl bg-white/80 hover:bg-white active:bg-slate-100 shadow-sm transition cursor-pointer text-slate-700"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </div>

      {/* 4 Big Answer Buttons: height ≥ 60px, font ≥ 20px */}
      <div id="answer-buttons-grid" className="grid grid-cols-2 gap-3 mb-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isTargetWord = option === question.target;

          let btnColorStyle =
            'bg-sky-50 text-slate-800 border-sky-300 hover:bg-sky-100 active:bg-sky-200';

          if (hasAnswered) {
            if (isTargetWord) {
              // Always turn green for the correct answer
              btnColorStyle =
                'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/30 font-extrabold';
            } else if (isSelected && !isCorrect) {
              // Selected wrong answer turns red
              btnColorStyle =
                'bg-rose-500 text-white border-rose-600 shadow-rose-500/30';
            } else {
              // Inactive unselected wrong answers
              btnColorStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
            }
          }

          return (
            <motion.button
              key={option}
              id={`btn-option-${index}-${option}`}
              disabled={hasAnswered}
              whileHover={!hasAnswered ? { scale: 1.02 } : {}}
              whileTap={!hasAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleSelectOption(option)}
              className={`h-16 min-h-[60px] rounded-2xl border-b-4 text-2xl font-bold capitalize transition-all flex items-center justify-center cursor-pointer shadow-sm ${btnColorStyle}`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* Action Next Button: Appears after answering */}
      <div className="h-16 min-h-[64px]">
        {hasAnswered ? (
          <motion.button
            id="btn-next-question"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundEffects.playClickSound();
              onNext();
            }}
            className="w-full h-16 min-h-[64px] rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-2xl font-bold tracking-wide shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 border-b-4 border-amber-700 transition-all cursor-pointer"
          >
            <span>{questionIndex + 1 === totalQuestions ? 'Finish' : 'Next'}</span>
            <ArrowRight className="w-7 h-7" />
          </motion.button>
        ) : (
          <div className="w-full h-full rounded-2xl border-2 border-dashed border-amber-200/80 flex items-center justify-center text-amber-600 text-lg font-medium">
            Tap an animal name above!
          </div>
        )}
      </div>
    </div>
  );
};
