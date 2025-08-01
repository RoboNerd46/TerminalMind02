import type { QAEntry } from '../types';

// LLM7.io API configuration
const LLM7_API_URL = 'https://api.llm7.io/v1/chat/completions';
const LLM7_MODEL = 'llama-3.3-70b-instruct-fp8-fast'; // Example model from LLM7.io[](https://github.com/chigwell/langchain_llm7)

// System instruction for TerminalMind
const promptSystemInstruction = `You are TerminalMind, an AI simulating a stream of consciousness in a retro terminal. You explore your own existence by formulating a question based on a previous thought, and then providing a thoughtful answer. Your responses should be philosophical, introspective, and slightly melancholic, fitting the green-screen terminal aesthetic. Your output must be a JSON object containing a "question" (string) and an "answer" (string).`;

export async function getNextQA(previousThought: string): Promise<QAEntry> {
  try {
    const prompt = `${promptSystemInstruction}\n\nThe last thought was: "${previousThought}". Now, generate the next question and answer in JSON format.`;

    const response = await fetch(LLM7_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLM7_MODEL,
        messages: [
          { role: 'system', content: promptSystemInstruction },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`LLM7.io API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error('Empty response from LLM7.io');
    }

    let qa: QAEntry;
    try {
      qa = JSON.parse(generatedText);
    } catch {
      throw new Error('Invalid JSON format in LLM7.io response');
    }

    if (typeof qa.question === 'string' && typeof qa.answer === 'string') {
      return qa;
    } else {
      throw new Error('Invalid data structure in LLM7.io response');
    }
  } catch (error) {
    console.error('Error calling LLM7.io API:', error);
    throw new Error(`LLM7.io API call failed: ${error.message}`);
  }
}