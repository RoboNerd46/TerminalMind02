import React from 'react';
import { TypingEffect } from './TypingEffect';
import type { QAEntry, Stage } from '../types';

interface TerminalProps {
  history: QAEntry[];
  currentQA: QAEntry | null;
  stage: Stage;
  error: string | null;
  onTypingComplete: (type: 'question' | 'answer') => void;
}

const Terminal: React.FC<TerminalProps> = ({ history, currentQA, stage, error, onTypingComplete }) => {
  return (
    <div className="w-full h-full bg-black text-green-500 font-mono text-lg p-4 relative overflow-hidden">
      {/* CRT Effect */}
      <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAAB5JREFUeAFjZGRgYGBgYGBgYGBgYGBgYGBgYGBoAABGyAAB3dW8YgAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/10 animate-flicker pointer-events-none"></div>

      <div className="h-full overflow-y-auto">
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            <p className="text-green-300">&gt; {entry.question}</p>
            <p className="text-green-500">{entry.answer}</p>
          </div>
        ))}
        {stage === 'thinking' && (
          <p className="text-green-300 animate-pulse">&gt; // Thinking...</p>
        )}
        {stage === 'typing_question' && currentQA && (
          <div className="mb-2">
            <TypingEffect
              text={`> ${currentQA.question}`}
              speed={50}
              onComplete={() => onTypingComplete('question')}
            />
          </div>
        )}
        {stage === 'typing_answer' && currentQA && (
          <div className="mb-2">
            <p className="text-green-300">&gt; {currentQA.question}</p>
            <TypingEffect
              text={currentQA.answer}
              speed={50}
              onComplete={() => onTypingComplete('answer')}
            />
          </div>
        )}
        {stage === 'error' && error && (
          <p className="text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Terminal;