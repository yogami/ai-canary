'use client';

import { useState, useEffect } from 'react';
import {
  getCachedStories,
  setCachedStories
} from '@/lib/cache';
import ValidatorPanel from '@/components/ValidatorPanel';

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

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'cached'>('live');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch background context for the AI Diligence Engine
      const res = await fetch('/api/news');

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (!data.stories || data.stories.length === 0) {
        const cached = getCachedStories() as Story[] | null;
        if (cached && cached.length > 0) {
          setStories(cached);
          setDataSource('cached');
          return;
        }
        setStories([]);
        setError('No stories available right now. Check back soon!');
        return;
      }

      const validatedStories = data.stories.filter((s: Story) =>
        s.uuid && s.headline && typeof s.headline === 'string'
      );

      setStories(validatedStories);
      setDataSource('live');
      setCachedStories(validatedStories);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      const cached = getCachedStories() as Story[] | null;
      if (cached && cached.length > 0) {
        setStories(cached);
        setDataSource('cached');
      } else {
        setError('Unable to load news.');
        setStories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              AICanary
            </h1>
            <p className="text-gray-300 font-medium">
              Deterministic Admission Control &amp; Diligence Engine
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Stress-testing early-stage venture claims against physical limits, levelized cost models, and live market signals
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full pulse ${dataSource === 'cached' ? 'bg-yellow-500' : error ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
              <span className="text-sm text-gray-400">
                {dataSource === 'cached' ? 'Cached' : error ? 'Limited' : 'Live Mode'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        <ValidatorPanel
          stories={stories.map(s => ({
            id: s.uuid,
            headline: s.headline,
            summary: s.summary,
            sentiment: (s.sentiment || 0) > 0.3 ? 'positive' : (s.sentiment || 0) < -0.3 ? 'negative' : 'neutral',
            sentimentScore: s.sentiment,
            coverage: s.coverage
          }))}
          onFilter={() => {}}
        />

        {/* Institutional Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <div className="glass-card p-4 mb-4 inline-block">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <span className="text-indigo-400 font-semibold">Background Knowledge Graph</span>
                <p className="text-xs text-gray-500">{stories.length} real-time indexed signals</p>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <span className="text-purple-400 font-semibold">Frontier Engine</span>
                <p className="text-xs text-gray-500">Claude 3.5 Sonnet • Deterministic Admission Control</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">AICanary Institutional Diligence Protocol • Verified Physics &amp; Causal Sensitivity</p>
        </footer>
      </main>
    </div>
  );
}
