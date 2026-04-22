'use client';

import Link from 'next/link';
import { Deck } from '@/lib/types';

interface Props {
  decks: Deck[];
  onDelete: (id: string) => void;
}

export default function DeckList({ decks, onDelete }: Props) {
  if (decks.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        No decks yet. Create your first deck above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {decks.map((deck) => (
        <li
          key={deck.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-0">
            <Link
              href={`/decks/${deck.id}`}
              className="font-medium text-indigo-600 hover:underline truncate block"
            >
              {deck.name}
            </Link>
            {deck.description && (
              <p className="text-sm text-slate-500 mt-0.5 truncate">
                {deck.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDelete(deck.id)}
            className="ml-4 shrink-0 text-sm text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
