export type AnimalWord =
  | 'cat'
  | 'dog'
  | 'lion'
  | 'elephant'
  | 'giraffe'
  | 'monkey'
  | 'rabbit'
  | 'bear'
  | 'fish'
  | 'bird'
  | 'cow'
  | 'pig'
  | 'duck'
  | 'frog'
  | 'horse';

export interface AnimalInfo {
  word: AnimalWord;
  article: 'a' | 'an';
  emoji: string;
  color: string; // Pastel/bright background accent color
  koreanHint?: string; // gentle subtitle if needed, but instructions say "All on-screen text in English, very short"
}

export interface Question {
  id: number;
  target: AnimalWord;
  options: AnimalWord[];
  article: 'a' | 'an';
  sentence: string; // e.g. "It's a lion."
}

export type ScreenMode = 'start' | 'game' | 'end';

export interface GameRoundState {
  questions: Question[];
  currentIndex: number;
  score: number;
  totalQuestions: number;
}
