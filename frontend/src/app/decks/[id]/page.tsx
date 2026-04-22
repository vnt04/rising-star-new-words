'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import CardList from '@/components/CardList';
import { apiFetch, ApiError } from '@/lib/api';
import { Card, Deck } from '@/lib/types';

export default function DeckDetailPage() {
  const params = useParams<{ id: string }>();
  const deckId = params.id;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    apiFetch<Deck & { cards: Card[] }>(`/decks/${deckId}`)
      .then((data) => {
        setDeck(data);
        setCards(data.cards ?? []);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load deck'))
      .finally(() => setLoading(false));
  }, [deckId]);

  async function handleAddCard(e: FormEvent) {
    e.preventDefault();
    setAddError('');
    setAdding(true);
    try {
      const card = await apiFetch<Card>('/cards', {
        method: 'POST',
        body: JSON.stringify({
          deckId,
          front: front.trim(),
          back: back.trim(),
          ...(example.trim() ? { example: example.trim() } : {}),
        }),
      });
      setCards((prev) => [...prev, card]);
      setFront('');
      setBack('');
      setExample('');
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : 'Failed to add card');
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateCard(id: string, patch: { front?: string; back?: string; example?: string }) {
    const updated = await apiFetch<Card>(`/cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }).catch(() => null);
    if (updated) {
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }

  async function handleDeleteCard(id: string) {
    await apiFetch(`/cards/${id}`, { method: 'DELETE' }).catch(() => null);
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <AuthGuard>
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/decks" className="text-sm text-slate-500 hover:underline">
              ← Back to decks
            </Link>
          </div>

          {loading && <p className="text-sm text-slate-500">Loading…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {deck && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{deck.name}</h1>
                  {deck.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{deck.description}</p>
                  )}
                </div>
                {cards.length > 0 && (
                  <Link
                    href={`/study/${deckId}`}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Study
                  </Link>
                )}
              </div>

              {/* Add card form */}
              <form onSubmit={handleAddCard} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 space-y-3">
                <h2 className="font-medium">Add a card</h2>
                {addError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{addError}</p>
                )}
                <input
                  type="text"
                  required
                  placeholder="Front"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  placeholder="Example sentence (optional)"
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {adding ? 'Adding…' : 'Add Card'}
                </button>
              </form>

              <CardList
                cards={cards}
                onUpdate={handleUpdateCard}
                onDelete={handleDeleteCard}
              />
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
