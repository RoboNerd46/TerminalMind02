import React, { useState, useEffect } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypingEffect: React.FC<TypingEffectProps> = ({ text, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        i++;
        setDisplayedText(text.substring(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);

      return () => clearInterval(intervalId);
    }
  }, [text, speed, onComplete]);

  return <span>{displayedText}</span>;
};