import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { advisorService } from '../services/services';
import { useAuthStore } from '../store/authStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'How are my sales today?',
  'What items are low on stock?',
  'Show me my debt situation',
  'How can I improve my scores?',
  'Give me tips to grow my business',
  'What is my Business Passport?',
];

export default function AdvisorPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: briefingRes } = useQuery({
    queryKey: ['daily-briefing'],
    queryFn: () => advisorService.getDailyBriefing(),
  });

  const briefing = briefingRes?.data?.data?.briefing;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (briefing && messages.length === 0) {
      setMessages([{ role: 'assistant', content: briefing, timestamp: new Date() }]);
    }
  }, [briefing]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await advisorService.chat(input.trim());
      const reply = data?.data?.response || 'Sorry, I could not process that request.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Could not reach the advisor. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto h-[calc(100vh-24px)] flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">AI Advisor</h1>
        <p className="text-sm text-gray-500">Powered by your real business data</p>
      </div>

      {/* Chat window */}
      <div className="card flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🤖</div>
            <p className="text-gray-500 text-sm">Your business advisor is ready. Ask about your sales, inventory, debts, or scores.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 bg-primary-50 text-primary-500 rounded-full hover:bg-primary-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm shrink-0">🤖</div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm shrink-0 font-bold text-gray-600">
                {user?.firstName?.[0]}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm shrink-0">🤖</div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions after first message */}
      {messages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button key={s} onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input
          className="input flex-1"
          placeholder="Ask about your business..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={loading}
        />
        <button className="btn-primary px-5" onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? '...' : '→'}
        </button>
      </div>
    </div>
  );
}
