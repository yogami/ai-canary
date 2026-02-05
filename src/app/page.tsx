'use client';

import { useState, useEffect } from 'react';

interface Story {
  uuid: string;
  headline: string;
  summary?: string;
  sentiment?: number;
  coverage?: number;
  publish_date?: string;
  categories?: string[];
  url?: string;
}

function SentimentBadge({ sentiment }: { sentiment?: number }) {
  if (sentiment === undefined) return null;

  const getSentimentClass = () => {
    if (sentiment > 0.3) return 'sentiment-positive';
    if (sentiment < -0.3) return 'sentiment-negative';
    return 'sentiment-neutral';
  };

  const getSentimentLabel = () => {
    if (sentiment > 0.3) return '🚀 Bullish';
    if (sentiment < -0.3) return '📉 Bearish';
    return '⚖️ Neutral';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentClass()}`}>
      {getSentimentLabel()}
    </span>
  );
}

function StoryCard({ story, onAlert }: { story: Story; onAlert: (story: Story) => void }) {
  return (
    <div className="glass-card p-6 fade-in">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-white leading-tight flex-1">
          {story.headline}
        </h3>
        <SentimentBadge sentiment={story.sentiment} />
      </div>

      {story.summary && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {story.summary}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {story.coverage && (
            <span className="text-xs text-gray-500">
              📊 {story.coverage}% coverage
            </span>
          )}
          {story.categories && story.categories.length > 0 && (
            <div className="flex gap-2">
              {story.categories.slice(0, 2).map((cat, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-gray-400">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onAlert(story)}
          className="glow-btn text-sm py-2 px-4"
        >
          🔔 Alert Me
        </button>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search AI news (e.g., RAG, LLM, Agents...)"
        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
        🔍
      </span>
    </div>
  );
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news');
      const data = await res.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlert = async (story: Story) => {
    try {
      const res = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, channel: 'slack' }),
      });
      const data = await res.json();

      setAlertMessage(`✅ Alert set for: "${story.headline.slice(0, 50)}..."`);
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      setAlertMessage('❌ Failed to set alert');
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const filteredStories = stories.filter(story =>
    search === '' ||
    story.headline.toLowerCase().includes(search.toLowerCase()) ||
    story.summary?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              AICanary
            </h1>
            <p className="text-gray-400">
              Real-time AI ecosystem intelligence • Never miss a market shift
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full pulse"></span>
            <span className="text-sm text-gray-400">Live</span>
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} />
      </header>

      {/* Alert Toast */}
      {alertMessage && (
        <div className="fixed top-4 right-4 glass-card px-6 py-4 z-50 fade-in">
          <p className="text-white font-medium">{alertMessage}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-white">{stories.length}</p>
            <p className="text-xs text-gray-400">Stories Today</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {stories.filter(s => (s.sentiment || 0) > 0.3).length}
            </p>
            <p className="text-xs text-gray-400">Bullish</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {stories.filter(s => (s.sentiment || 0) < -0.3).length}
            </p>
            <p className="text-xs text-gray-400">Bearish</p>
          </div>
        </div>

        {/* Stories List */}
        <div className="space-y-4">
          {loading ? (
            <div className="glass-card p-12 text-center">
              <div className="animate-spin text-4xl mb-4">⚡</div>
              <p className="text-gray-400">Loading AI ecosystem intelligence...</p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-400">No stories found for "{search}"</p>
            </div>
          ) : (
            filteredStories.map((story, index) => (
              <div key={story.uuid} style={{ animationDelay: `${index * 0.1}s` }}>
                <StoryCard story={story} onAlert={handleAlert} />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Built with 💜 at AI Hackday Berlin • Feb 2026</p>
          <p className="mt-1 text-xs">
            Powered by <span className="text-indigo-400">AskNews</span> + <span className="text-purple-400">ActivePieces</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
