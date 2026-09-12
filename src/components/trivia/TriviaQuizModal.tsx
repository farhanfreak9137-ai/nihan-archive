import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Dices,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Award,
  Loader2,
} from 'lucide-react';
import { SearchItem, SenderId } from '../../types/archive';
import { fetchSearchIndex } from '../../lib/data';

interface TriviaQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToMessage: (date: string, messageId: string) => void;
}

interface QuizQuestion {
  item: SearchItem;
  correctSender: SenderId;
  correctSenderDisplay: 'NILA' | 'FARHAN';
}

export const TriviaQuizModal: React.FC<TriviaQuizModalProps> = ({
  isOpen,
  onClose,
  onJumpToMessage,
}) => {
  const [searchIndex, setSearchIndex] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<SenderId | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Load search index
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const index = await fetchSearchIndex();
        if (!isCancelled) {
          setSearchIndex(index);
        }
      } catch (err) {
        console.error('Failed to load search index for trivia:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // Candidate quotes pool
  const candidateQuotes = useMemo(() => {
    if (searchIndex.length === 0) return [];
    return searchIndex.filter((m) => {
      if (m.type !== 'text' || !m.content) return false;
      const text = m.content.trim();
      if (text.length < 24 || text.length > 180) return false;
      if (
        text.startsWith('Liked a message') ||
        text.startsWith('Reacted ') ||
        text.includes('sent an attachment') ||
        text.startsWith('http') ||
        text.includes('instagram.com')
      ) {
        return false;
      }
      return m.sender === 'NILU' || m.sender === 'farhannn';
    });
  }, [searchIndex]);

  // Questions for the current 5-round game
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const startNewGame = () => {
    if (candidateQuotes.length < 5) return;
    // Shuffle and pick 5 distinct quotes
    const shuffled = [...candidateQuotes].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 5).map((item) => ({
      item,
      correctSender: item.sender,
      correctSenderDisplay: item.sender === 'NILU' ? ('NILA' as const) : ('FARHAN' as const),
    }));

    setQuestions(picked);
    setCurrentRound(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isOpen && candidateQuotes.length >= 5 && questions.length === 0) {
      startNewGame();
    }
  }, [isOpen, candidateQuotes]);

  if (!isOpen) return null;

  const currentQ = questions[currentRound];

  const handleChoose = (answer: SenderId) => {
    if (isAnswerRevealed || !currentQ) return;
    setSelectedAnswer(answer);
    setIsAnswerRevealed(true);
    if (answer === currentQ.correctSender) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentRound < questions.length - 1) {
      setCurrentRound((r) => r + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      setIsFinished(true);
    }
  };

  const getRankBadge = (finalScore: number) => {
    if (finalScore === 5) {
      return { title: '🏆 Certified Soulmate Expert', desc: 'Flawless 100% score! You know each other word for word.' };
    }
    if (finalScore === 4) {
      return { title: '🌟 Memory Master', desc: 'Incredible accuracy! Almost perfect recall.' };
    }
    if (finalScore === 3) {
      return { title: '💖 True Romantic', desc: 'Great job! You recognize each other’s messaging rhythm.' };
    }
    return { title: '🌱 Memory In Training', desc: 'Good effort! Time to spend more hours in the archive.' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0b0d10] border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-editorial text-white font-semibold leading-tight">
                Who Said It?
              </h2>
              <span className="text-[10px] font-mono text-[#8b949e]">
                Relationship Trivia • 5 Questions
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        {isLoading || questions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
            <p className="text-xs font-mono">Generating trivia questions from 61,372 messages...</p>
          </div>
        ) : isFinished ? (
          /* Finished Scorecard */
          <div className="py-6 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Award className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
                Trivia Game Completed
              </span>
              <h3 className="text-3xl font-mono font-bold text-white">
                {score} / 5 Correct
              </h3>
              <p className="text-sm text-[#8b949e] font-sans">
                {Math.round((score / 5) * 100)}% Match Accuracy
              </p>
            </div>

            {/* Rank badge */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto space-y-1">
              <div className="text-sm font-semibold text-amber-300 font-editorial">
                {getRankBadge(score).title}
              </div>
              <p className="text-xs text-slate-300">
                {getRankBadge(score).desc}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs font-mono shadow-md active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs font-mono transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Active Question Card */
          <div className="py-6 space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
              <span>Round {currentRound + 1} of 5</span>
              <span className="text-rose-400 font-semibold">Score: {score}</span>
            </div>

            {/* Segmented Progress bar */}
            <div className="flex items-center gap-1.5 w-full">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < currentRound
                      ? 'bg-rose-500'
                      : i === currentRound
                      ? 'bg-amber-400'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Quote Card */}
            <div className="relative p-6 rounded-2xl bg-black/40 border border-white/10 shadow-inner min-h-[140px] flex items-center justify-center text-center">
              <span className="absolute top-2 left-4 text-3xl text-white/20 font-serif select-none leading-none">
                “
              </span>
              <p className="text-base sm:text-lg font-sans text-slate-100 font-medium leading-relaxed max-w-md px-4 select-text">
                {currentQ.item.content}
              </p>
              <span className="absolute bottom-2 right-4 text-3xl text-white/20 font-serif select-none leading-none">
                ”
              </span>
            </div>

            {/* Answer Options */}
            {!isAnswerRevealed ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleChoose('NILU')}
                  className="py-3 px-4 rounded-2xl bg-[#161b22] hover:bg-rose-500/20 hover:border-rose-500/50 border border-[#30363d] text-rose-300 font-semibold font-mono text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 group-hover:scale-125 transition-transform" />
                  <span>NILA</span>
                </button>

                <button
                  onClick={() => handleChoose('farhannn')}
                  className="py-3 px-4 rounded-2xl bg-[#161b22] hover:bg-sky-500/20 hover:border-sky-500/50 border border-[#30363d] text-sky-300 font-semibold font-mono text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400 group-hover:scale-125 transition-transform" />
                  <span>FARHAN</span>
                </button>
              </div>
            ) : (
              /* Revealed feedback */
              <div className="space-y-4 pt-1 animate-fade-in">
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    selectedAnswer === currentQ.correctSender
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {selectedAnswer === currentQ.correctSender ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-mono font-bold text-xs">
                        {selectedAnswer === currentQ.correctSender ? 'CORRECT! 🎉' : 'NOT QUITE!'}
                      </span>
                      <p className="text-xs font-sans text-white/90">
                        Said by{' '}
                        <strong className="text-white underline">
                          {currentQ.correctSenderDisplay}
                        </strong>{' '}
                        on {currentQ.item.date} at {currentQ.item.time}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onJumpToMessage(currentQ.item.date, currentQ.item.id);
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-white border border-white/10 shrink-0"
                    title="Jump to message in conversation"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>View in Chat</span>
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-xs font-mono shadow-md active:scale-95 transition-all"
                  >
                    <span>{currentRound < 4 ? 'Next Question' : 'See Results'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
