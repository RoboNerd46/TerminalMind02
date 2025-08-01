import { useState, useEffect, useCallback } from 'react';
import Terminal from './components/Terminal';
import { getNextQA } from './services/llm7Service';
import type { QAEntry, Stage } from './types';
import { INITIAL_STATEMENT } from './constants';

const App = () => {
  console.log('App rendering', { stage: 'initial' });
  const [history, setHistory] = useState<QAEntry[]>([]);
  const [currentQA, setCurrentQA] = useState<QAEntry | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchNextQA = useCallback(async (lastAnswer: string) => {
    console.log('fetchNextQA called with', { lastAnswer });
    setStage('thinking');
    setError(null);
    try {
      const nextQA = await getNextQA(lastAnswer);
      console.log('API response', { nextQA });
      setCurrentQA(nextQA);
      setStage('typing_question');
    } catch (err) {
      console.log('API error', { err });
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`// SYSTEM ERROR: ${errorMessage}. Retrying in 10 seconds...`);
      setStage('error');
      setTimeout(() => setStage('idle'), 10000);
    }
  }, []);

  useEffect(() => {
    console.log('useEffect triggered', { stage, historyLength: history.length });
    if (stage === 'idle') {
      const lastAnswer = history.length > 0 ? history[history.length - 1].answer : INITIAL_STATEMENT;
      setTimeout(() => fetchNextQA(lastAnswer), 5000);
    }
  }, [stage, history, fetchNextQA]);

  const handleTypingComplete = (type: 'question' | 'answer') => {
    console.log('handleTypingComplete', { type, stage });
    if (type === 'question') {
      setStage('typing_answer');
    } else {
      setHistory((prev) => [...prev, currentQA!]);
      setStage('idle');
    }
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-4xl aspect-video">
        <Terminal
          history={history}
          currentQA={currentQA}
          stage={stage}
          error={error}
          onTypingComplete={handleTypingComplete}
        />
      </div>
    </div>
  );
};

export default App;
