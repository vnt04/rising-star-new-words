'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import DeckList from '@/components/DeckList';
import { apiFetch, ApiError } from '@/lib/api';
import { removeToken } from '@/lib/auth';
import { Deck } from '@/lib/types';

export default function DecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    apiFetch<Deck[]>('/decks')
      .then(setDecks)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load decks'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const deck = await apiFetch<Deck>('/decks', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
        }),
      });
      setDecks((prev) => [deck, ...prev]);
      setName('');
      setDescription('');
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Failed to create deck');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/decks/${id}`, { method: 'DELETE' }).catch(() => null);
    setDecks((prev) => prev.filter((d) => d.id !== id));
  }

  function handleLogout() {
    removeToken();
    router.replace('/login');
  }

  return (
    <AuthGuard>
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Decks</h1>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:underline">
              Log out
            </button>
          </div>

          {/* Create deck form */}
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 space-y-3">
            <h2 className="font-medium">Create a deck</h2>
            {createError && (
              <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{createError}</p>
            )}
            <input
              type="text"
              required
              placeholder="Deck name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create Deck'}
            </button>
          </form>

          {loading && <p className="text-sm text-slate-500">Loading…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && <DeckList decks={decks} onDelete={handleDelete} />}
        </div>
      </div>
    </AuthGuard>
  );
}
