import { AnimalWord, AnimalInfo, Question } from '../types';

export const ANIMAL_LIST: AnimalInfo[] = [
  { word: 'cat', article: 'a', emoji: '🐱', color: '#fed7aa' }, // orange-200
  { word: 'dog', article: 'a', emoji: '🐶', color: '#fef08a' }, // yellow-200
  { word: 'lion', article: 'a', emoji: '🦁', color: '#fde047' }, // yellow-300
  { word: 'elephant', article: 'an', emoji: '🐘', color: '#e2e8f0' }, // slate-200
  { word: 'giraffe', article: 'a', emoji: '🦒', color: '#fef08a' }, // yellow-200
  { word: 'monkey', article: 'a', emoji: '🐵', color: '#ffedd5' }, // orange-100
  { word: 'rabbit', article: 'a', emoji: '🐰', color: '#fce7f3' }, // pink-100
  { word: 'bear', article: 'a', emoji: '🐻', color: '#f5d0fe' }, // fuchsia-200
  { word: 'fish', article: 'a', emoji: '🐟', color: '#bae6fd' }, // sky-200
  { word: 'bird', article: 'a', emoji: '🐦', color: '#bbf7d0' }, // green-200
  { word: 'cow', article: 'a', emoji: '🐮', color: '#e2e8f0' }, // slate-200
  { word: 'pig', article: 'a', emoji: '🐷', color: '#fbcfe8' }, // pink-200
  { word: 'duck', article: 'a', emoji: '🦆', color: '#fef9c3' }, // yellow-100
  { word: 'frog', article: 'a', emoji: '🐸', color: '#bbf7d0' }, // green-200
  { word: 'horse', article: 'a', emoji: '🐴', color: '#fed7aa' }, // orange-200
];

export const ANIMAL_MAP = new Map<AnimalWord, AnimalInfo>(
  ANIMAL_LIST.map((item) => [item.word, item])
);

/**
 * Fisher-Yates shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Creates 10 questions with NO repeats from the 15 animals.
 * Each question has 4 options (1 correct + 3 random wrong options from the remaining 14 animals).
 */
export function generateGameQuestions(count: number = 10): Question[] {
  const allWords = ANIMAL_LIST.map((a) => a.word);
  const shuffledTargets = shuffleArray(allWords).slice(0, count);

  return shuffledTargets.map((target, index) => {
    const info = ANIMAL_MAP.get(target)!;
    const remainingWords = allWords.filter((w) => w !== target);
    const wrongChoices = shuffleArray(remainingWords).slice(0, 3);
    const options = shuffleArray([target, ...wrongChoices]);

    return {
      id: index + 1,
      target,
      options,
      article: info.article,
      sentence: `It's ${info.article} ${target}.`,
    };
  });
}
