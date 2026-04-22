'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/lib/types';

export default function StudyPage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params.deckId;

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    apiFetch<Card[]>(`/cards?deckId=${deckId}`)
      .then(setCards)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load cards'))
      .finally(() => setLoading(false));
  }, [deckId]);

  function handleFlip() {
    setFlipped((f) => !f);
  }

  function handleNext() {
    setIndex((i) => i + 1);
    setFlipped(false);
  }

  function handlePrev() {
    setIndex((i) => i - 1);
    setFlipped(false);
  }

  const current = cards[index];

  return (
    <AuthGuard>
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <Link href={`/decks/${deckId}`} className="text-sm text-slate-500 hover:underline">
              ← Back to deck
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6">Study</h1>

          {loading && <p className="text-sm text-slate-500">Loading cards…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && cards.length === 0 && (
            <p className="text-slate-500">
              No cards in this deck — add some first.
            </p>
          )}

          {!loading && current && (
            <>
              <p className="text-sm text-slate-500 mb-4 text-center">
                Card {index + 1} / {cards.length}
              </p>

              <div
                onClick={handleFlip}
                className="bg-white rounded-2xl border border-slate-200 shadow-md p-10 text-center cursor-pointer select-none min-h-[200px] flex flex-col items-center justify-center"
              >
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">
                  {flipped ? 'Back' : 'Front'}
                </p>
                <p className="text-2xl font-semibold">
                  {flipped ? current.back : current.front}
                </p>
                {flipped && current.example && (
                  <p className="text-sm text-slate-500 mt-4 italic">{current.example}</p>
                )}
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={handlePrev}
                  disabled={index === 0}
                  className="px-5 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:bg-slate-100"
                >
                  Previous
                </button>
                <button
                  onClick={handleFlip}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Flip
                </button>
                <button
                  onClick={handleNext}
                  disabled={index === cards.length - 1}
                  className="px-5 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
