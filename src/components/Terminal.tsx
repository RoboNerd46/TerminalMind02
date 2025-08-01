import type { QAEntry, Stage } from '../types';

interface TerminalProps {
  history: QAEntry[];
  currentQA: QAEntry | null;
  stage: Stage;
  error: string | null;
  onTypingComplete: (type: 'question' | 'answer') => void;
}

const Terminal = ({ history, currentQA, stage, error, onTypingComplete }: TerminalProps) => {
  console.log('Terminal rendering', { stage, currentQA, error });

  return (
    <div className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm p-4 overflow-auto">
      {history.map((entry, index) => (
        <div key={index}>
          <div>{`> ${entry.question}`}</div>
          <div>{entry.answer}</div>
        </div>
      ))}
      {error && <div className="text-red-500">{error}</div>}
      {currentQA && stage !== 'idle' && (
        <>
          {stage === 'typing_question' && (
            <div>
              {`> ${currentQA.question.slice(0, 1)}`}
              <span className="animate-pulse">█</span>
            </div>
          )}
          {stage === 'typing_answer' && (
            <div>
              {currentQA.answer.slice(0, 1)}
              <span className="animate-pulse">█</span>
            </div>
          )}
        </>
      )}
      {!currentQA && stage === 'thinking' && <div>Thinking...</div>}
    </div>
  );
};

export default Terminal;
