import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardCarouselProps {
  flashcards: Flashcard[];
}

export const FlashcardCarousel = ({ flashcards }: FlashcardCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <div className="text-zinc-500 text-center py-20">No flashcards available.</div>;
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    }, 150);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div 
        className="relative w-full max-w-2xl h-80 perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`w-full h-full transition-transform duration-500 transform-style-preserve-3d relative ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl hover:border-primary/50 transition-colors">
            <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-primary">Question</span>
            <h3 className="text-2xl text-center font-medium text-white leading-relaxed">
              {currentCard.question}
            </h3>
            <span className="absolute bottom-6 text-sm text-zinc-500">Click to reveal answer</span>
          </div>
          
          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-primary/10 backdrop-blur-md border border-primary/30 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl rotate-y-180 hover:bg-primary/20 transition-colors">
            <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-primary">Answer</span>
            <p className="text-xl text-center text-zinc-100 leading-relaxed">
              {currentCard.answer}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-10">
        <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full bg-transparent border-white/10 hover:bg-white/5">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Button>
        <span className="text-zinc-400 font-medium tracking-widest">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full bg-transparent border-white/10 hover:bg-white/5">
          <ChevronRight className="w-5 h-5 text-white" />
        </Button>
      </div>
    </div>
  );
};
