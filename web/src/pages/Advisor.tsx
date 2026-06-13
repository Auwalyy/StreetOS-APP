import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { advisorService } from '../services/services';
import { aiService } from '../services/aiService';
import { useAuthStore } from '../store/authStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AdvisorPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'chat' | 'market'>('chat');
  const [region, setRegion] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: briefingData } = useQuery({
    queryKey: ['daily-briefing'],
    queryFn: () => advisorService.getDailyBriefing(),
  });
  const { data: marketData, refetch: fetchMarket, isFetching: marketLoading } = useQuery({
    queryKey: ['market-intel', region],
    queryFn: () => advisorService.getMarketIntelligence(region || undefined),
    enabled: false,
  });

  const briefing = briefingData?.data?.data?.briefing || briefingData?.data?.data?.message;
  const market = marketData?.data?.data;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Seed with daily briefing as first message
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
      // Try AI service first, fall back to backend advisor
      let reply = '';
      try {
        const { data } = await aiService.advisorChat(input.trim(), user?.id, user?.language || 'en');
        reply = data.response || data.message || data.reply || JSON.stringify(data);
      } catch {
        const { data } = await advisorService.chat(input.trim());
        reply = data.data?.response || data.data?.message || 'I could not process that request.';
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not reach the AI service. Make sure it is running on port 8000.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTIONS = [
    'How can I increase my sales this week?',
    'What products should I stock up on?',
    'Analyze my business health',
    'How do I manage my debts better?',
    'Give me tips to reduce expenses',
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-24px)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">AI Advisor</h1>
        <div className="flex gap-2">
          {(['chat', 'market'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${tab === t ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {t === 'chat' ? '💬 Chat' : '📈 Market Intel'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'chat' ? (
        <>
          {/* Chat window */}
          <div className="card flex-1 overflow-y-auto space-y-4 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🤖</div>
                <p className="text-gray-500 text-sm">Your AI business advisor is ready. Ask me anything about your business!</p>
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
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
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
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              className="input flex-1"
              placeholder="Ask your AI advisor anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button className="btn-primary px-5" onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? '...' : '→'}
            </button>
          </div>

          {/* Quick suggestions */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <button key={s} onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Market Intelligence */
        <div className="card flex-1 overflow-y-auto space-y-4">
          <div className="flex gap-3">
            <input
              className="input flex-1"
              placeholder="Enter region (e.g. Lagos, Kano, Abuja)"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
            <button className="btn-primary" onClick={() => fetchMarket()} disabled={marketLoading}>
              {marketLoading ? 'Loading...' : '🔍 Fetch'}
            </button>
          </div>

          {market ? (
            <div className="space-y-4">
              {market.insights && (
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-primary-500 mb-2">📊 Market Insights</p>
                  <p className="text-sm text-primary-400 leading-relaxed">{market.insights}</p>
                </div>
              )}
              {market.trending && Array.isArray(market.trending) && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">🔥 Trending Products</p>
                  <div className="flex flex-wrap gap-2">
                    {market.trending.map((t: string, i: number) => (
                      <span key={i} className="badge bg-accent-400/20 text-accent-500 px-3 py-1">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {market.recommendations && Array.isArray(market.recommendations) && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">💡 Recommendations</p>
                  <ul className="space-y-2">
                    {market.recommendations.map((r: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-success">✓</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📈</div>
              <p className="text-gray-500 text-sm">Enter a region and fetch real-time market intelligence powered by Gemini AI.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
